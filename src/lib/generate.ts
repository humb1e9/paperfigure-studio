// 真实生成 / 重建：直接调用 forge/*.mjs 里的请求模块，提示词是简化版。
import { requestStep3Svg } from '@forge/step3-svg-request.mjs'
import { compatibleImageRequest, requestImageWithRecovery } from '@forge/image-api.mjs'
import { extractEditableNodes } from '@forge/reconstruction-core.mjs'
import { buildNativePptx } from '@forge/editable-native.mjs'
import { zipStore } from './zip'
import type { ApiConfig } from '../types'

const base = (c: ApiConfig) => c.baseUrl.trim().replace(/\/+$/, '')
const parseXML = (s: string) => new DOMParser().parseFromString(s, 'image/svg+xml')

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片加载失败：' + src.slice(0, 80)))
    img.src = src
  })
}

// 缩到长边 max 像素再转 data URI，避免请求体过大
export async function toDataUri(src: string, max = 1024, type = 'image/jpeg'): Promise<{ uri: string; width: number; height: number }> {
  const img = await loadImage(src)
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
  const width = Math.max(1, Math.round(img.naturalWidth * scale))
  const height = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)
  return { uri: canvas.toDataURL(type, 0.9), width, height }
}

async function chatJson(c: ApiConfig, model: string, content: unknown[], signal?: AbortSignal) {
  const res = await fetch(base(c) + '/chat/completions', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.apiKey}` },
    body: JSON.stringify({ model, max_tokens: 4000, messages: [{ role: 'user', content }] })
  })
  if (!res.ok) throw new Error(`接口 HTTP ${res.status}：${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return String(data?.choices?.[0]?.message?.content ?? '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

// 用看图模型总结参考图的视觉风格，结果给用户编辑后用于生成
export async function analyzeStyle(c: ApiConfig, refs: string[], signal?: AbortSignal): Promise<string> {
  const model = c.parseModel || c.generateModel
  if (!model) throw new Error('请在设置里填写「解析模型」（能看图的对话模型）')
  if (!refs.length) throw new Error('请先添加参考图')
  const text = `下面是 ${refs.length} 张学术论文插图，用作绘图风格参考。请只总结它们共同的视觉风格，不要描述具体内容，供另一个模型照着画新图。
按以下条目用中文简洁输出（每条一行，给出具体值，如十六进制颜色、大致字号、线宽）：
- 整体类型与版式
- 配色（主色、强调色、背景、文字色）
- 形状与模块（圆角、描边、填充、阴影）
- 线条与箭头
- 字体与文字（字体类型、粗细、大小层级）
- 图标/示意元素
- 留白与对齐
- 其他显著特征
只输出这些条目，不要前言。`
  return chatJson(c, model, [{ type: 'text', text }, ...refs.map(url => ({ type: 'image_url', image_url: { url } }))], signal)
}

function brief(intent: string, paper: string) {
  return [
    intent && `要画的图：${intent}`,
    `论文内容（据此决定模块、箭头和标签）：\n${paper.slice(0, 12000)}`
  ].filter(Boolean).join('\n\n')
}

const BASE_STYLE =
  '学术论文插图风格：白底、扁平、配色克制（2–4 种主色）、圆角矩形模块、清晰的箭头数据流、无衬线英文标签、不要标题和图注、不要水印。参考图只用于借鉴版式和配色，不要照抄其中的内容。'

const style = (notes: string) =>
  notes.trim() ? `${BASE_STYLE}\n\n请严格遵循以下视觉风格（从参考图归纳）：\n${notes.trim().slice(0, 3000)}` : BASE_STYLE

export async function generateSvg(c: ApiConfig, intent: string, paper: string, refs: string[], notes: string, signal?: AbortSignal, onRetry?: (msg: string) => void) {
  const content: unknown[] = [
    { type: 'text', text: `${brief(intent, paper)}\n\n${style(notes)}\n\n请输出一张完整的 SVG（viewBox="0 0 1600 900"），所有文字用 <text> 元素，只输出 SVG 代码，不要解释。` },
    ...refs.map(url => ({ type: 'image_url', image_url: { url } }))
  ]
  const { code } = await requestStep3Svg({
    base: base(c),
    key: c.apiKey,
    parseXML,
    signal,
    modelBody: { model: c.generateModel || c.parseModel, messages: [{ role: 'user', content }], max_tokens: 16000 },
    onRetry: info => onRetry?.(`第 ${info.attempt} 次失败（${info.error.message}），正在重试 ${info.nextAttempt}/${info.maxAttempts}…`)
  })
  return code
}

export async function generateBitmap(c: ApiConfig, intent: string, paper: string, refs: string[], notes: string) {
  const model = c.imageModel || c.generateModel
  if (!model) throw new Error('请在设置里填写「图像模型」（如 gpt-image-2）')
  const prompt = `${brief(intent, paper).slice(0, 2500)}\n\n${style(notes).slice(0, 1400)} 横版 16:9。`
  const body: Record<string, unknown> = { model, prompt, size: '1536x1024', n: 1 }
  if (refs.length) body.image = refs
  const req = compatibleImageRequest(body, base(c), c.provider)
  const r = await requestImageWithRecovery({
    url: base(c) + req.endpoint,
    body: req.body,
    key: c.imageApiKey || c.apiKey,
    usedReferences: refs.length > 0,
    allowReferenceFallback: true
  })
  if (!r.ok) throw new Error(`图像接口 HTTP ${r.status}：${r.text.slice(0, 300)}`)
  let data: any
  try { data = JSON.parse(r.text) } catch { throw new Error('图像接口返回的不是 JSON') }
  const item = data?.data?.[0]
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`
  if (item?.url) return item.url as string
  throw new Error('图像接口没有返回图片（缺少 data[0].b64_json / url）')
}

// SVG 字符串栅格化成 PNG data URI
export async function svgToPng(svg: string, width = 1600): Promise<string> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  try { return (await toDataUri(url, width, 'image/png')).uri } finally { URL.revokeObjectURL(url) }
}

const RECON_PROMPT = (w: number, h: number) => `把这张图重建为可编辑矢量场景，画布 ${w}x${h} 像素，坐标原点在左上角。
只输出 JSON：{"canvas":{"width":${w},"height":${h}},"nodes":[...]}
节点类型（按从底到顶的绘制顺序排列）：
- {"type":"rect","x","y","w","h","fill":"#RRGGBB","stroke":"#RRGGBB","strokeWidth","radius"}
- {"type":"ellipse","x","y","w","h","fill","stroke","strokeWidth"}
- {"type":"line","x","y","x2","y2","stroke","strokeWidth","arrow":true 表示终点有箭头}
- {"type":"path","d":"SVG path","fill","stroke","strokeWidth"}
- {"type":"text","x","y","w","h","text","fontSize","fill":"文字颜色","bold","anchor":"start|middle|end"}
要求：文字逐字照抄，不要遗漏任何模块、箭头和标签；没有填充用 "none"。不要输出解释。`

export async function reconstructPptx(c: ApiConfig, imageSrc: string, signal?: AbortSignal): Promise<{ blob: Blob; count: number }> {
  const model = c.reconstructModel || c.parseModel
  if (!model) throw new Error('请在设置里填写「重建模型」（能看图的对话模型）')
  const { uri, width, height } = await toDataUri(imageSrc, 1600, 'image/png')
  const res = await fetch(base(c) + '/chat/completions', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: 16000,
      messages: [{ role: 'user', content: [{ type: 'text', text: RECON_PROMPT(width, height) }, { type: 'image_url', image_url: { url: uri } }] }]
    })
  })
  if (!res.ok) throw new Error(`重建接口 HTTP ${res.status}`)
  const data = await res.json()
  const raw = String(data?.choices?.[0]?.message?.content ?? '')
  const text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```(?:json)?/gi, '')
  const first = text.indexOf('{'), last = text.lastIndexOf('}')
  if (first < 0 || last < first) throw new Error('重建模型没有返回 JSON')
  const nodes = extractEditableNodes(JSON.parse(text.slice(first, last + 1)))
  if (!nodes.length) throw new Error('重建结果为空')
  const scene = { canvas: { width, height }, nodes: nodes.map((n, i) => ({ id: n.id || `n${i}`, ...n })) }
  const blob = await buildNativePptx(scene, zipStore)
  return { blob, count: nodes.length }
}

export function download(data: Blob | string, filename: string) {
  const url = typeof data === 'string' ? data : URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  if (typeof data !== 'string') setTimeout(() => URL.revokeObjectURL(url), 1000)
}
