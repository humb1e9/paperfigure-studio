import { useEffect, useRef, useState } from 'react'
import { useForgeState } from '../lib/useForgeState'
import { useApiConfig } from '../lib/useApiConfig'
import { generateSvg, generateBitmap, analyzeStyle, svgToPng, download } from '../lib/generate'
import './Step3Generate.css'

function DownloadIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v9m-3-3 3 3 3-3M4 13v3h12v-3" /></svg>
}

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" /></svg>
}

export default function Step3Generate() {
  const { state, setStep, setIntent, setPaperText, setGenerating, setResult, setError } = useForgeState()
  const { config, isConfigured } = useApiConfig()
  const [mode, setMode] = useState<'svg' | 'image'>('svg')
  const [status, setStatus] = useState('')
  const [expanded, setExpanded] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!expanded) return
    const overflow = document.body.style.overflow
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpanded(false) }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', close)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', close)
    }
  }, [expanded])

  const handleGenerate = async () => {
    if (!isConfigured) {
      setError('请先在右上角「设置」里配置 API')
      return
    }
    setGenerating(true)
    const ac = new AbortController()
    abortRef.current = ac
    try {
      const refs = state.refs.map(r => r.uri)
      let notes = ''
      if (refs.length) {
        setStatus('正在分析参考图风格（20–60 秒）…')
        notes = await analyzeStyle(config, refs, ac.signal)
      }
      setStatus(mode === 'svg' ? '模型正在绘制 SVG，通常需要 1–3 分钟…' : '图像模型正在出图，通常需要 1–2 分钟…')
      if (mode === 'svg') {
        const svg = await generateSvg(config, state.intent, state.paperText, refs, notes, ac.signal, setStatus)
        setResult(svg, null)
      } else {
        const img = await generateBitmap(config, state.intent, state.paperText, refs, notes)
        setResult(null, img)
      }
      setStatus('')
    } catch (err) {
      setStatus('')
      if (ac.signal.aborted) setError('已取消')
      else setError(err instanceof Error ? err.message : '生成失败')
    } finally {
      abortRef.current = null
    }
  }

  const hasResult = !!(state.generatedSvg || state.generatedImage)
  const downloadPng = async () => {
    if (state.generatedImage) return download(state.generatedImage, 'figure.png')
    if (state.generatedSvg) download(await svgToPng(state.generatedSvg, 3200), 'figure.png')
  }
  const downloadSvg = () => download(new Blob([state.generatedSvg!], { type: 'image/svg+xml' }), 'figure.svg')
  const modelName = (mode === 'image' ? (config.imageModel || config.generateModel) : (config.generateModel || config.parseModel)) || '未配置'
  const busy = state.generating

  return (
    <div className="step-panel gen2">
      <div className="gen2-grid">
        <section className="gen2-form" aria-labelledby="gen2-title">
          <header className="gen2-heading">
            <h2 id="gen2-title">生成初稿</h2>
            <p>整理论文内容，让模型为你构建清晰的学术图示。</p>
          </header>

          <div className="gen2-paper">
            <div className="gen2-label-row">
              <label htmlFor="gen2-paper">论文内容</label>
              <span>必填</span>
            </div>
            <textarea
              id="gen2-paper"
              className="gen2-input"
              rows={7}
              placeholder="粘贴论文摘要、方法段落或正文…"
              value={state.paperText}
              onChange={e => setPaperText(e.target.value)}
              disabled={busy}
            />
          </div>

          <section className="gen2-refs" aria-labelledby="gen2-ref-title">
            <div className="gen2-label-row">
              <h3 id="gen2-ref-title">参考图 <span>{state.refs.length}</span></h3>
              <button className="gen2-link" onClick={() => setStep(1)} disabled={busy}>
                {state.refs.length ? '修改' : '选择参考图'}
              </button>
            </div>
            {state.refs.length ? (
              <div className="gen2-thumbs">
                {state.refs.map(r => <img key={r.id} src={r.uri} alt={r.label} title={r.label} />)}
              </div>
            ) : (
              <p className="gen2-ref-empty">可选 · 自动提取参考图的配色与布局</p>
            )}
          </section>

          <details className="gen2-options">
            <summary>生成选项 <span>{mode === 'svg' ? 'SVG 矢量图' : 'AI 位图'}</span></summary>
            <fieldset disabled={busy}>
              <label htmlFor="gen2-intent">绘图意图（可选）</label>
              <input id="gen2-intent" className="gen2-input" placeholder="例如：方法总览图" value={state.intent} onChange={e => setIntent(e.target.value)} />
              <label htmlFor="gen2-format">输出格式</label>
              <select id="gen2-format" className="gen2-input" value={mode} onChange={e => setMode(e.target.value === 'image' ? 'image' : 'svg')}>
                <option value="svg">SVG 矢量图</option>
                <option value="image">AI 位图</option>
              </select>
              <p>当前模型 · {modelName}</p>
            </fieldset>
          </details>

          <div className="gen2-actions">
            {busy ? (
              <button className="gen2-go gen2-cancel" onClick={() => abortRef.current?.abort()}>取消生成</button>
            ) : (
              <button className="gen2-go" onClick={handleGenerate} disabled={!state.paperText.trim()}>
                {hasResult ? '重新生成' : '生成初稿'}<ArrowIcon />
              </button>
            )}
            {busy && <p className="generate-status" role="status">{status || '正在生成…'}</p>}
            {state.error && <div className="error-message" role="alert">{state.error}</div>}
          </div>
        </section>

        <section className={`gen2-canvas${expanded ? ' is-expanded' : ''}`} aria-labelledby="gen2-preview-title">
          <header className="gen2-canvas-bar">
            <div className="gen2-canvas-title">
              <h3 id="gen2-preview-title">初稿画布</h3>
              <span className={hasResult ? 'is-ready' : ''}>{busy ? '生成中' : hasResult ? '已完成' : '等待生成'}</span>
            </div>
            <div className="gen2-canvas-tools">
              {hasResult && !busy && <div className="gen2-downloads">
                {state.generatedSvg && <button onClick={downloadSvg}><DownloadIcon />SVG</button>}
                <button onClick={downloadPng}><DownloadIcon />PNG</button>
              </div>}
              <button className="gen2-expand" onClick={() => setExpanded(!expanded)} aria-label={expanded ? '收起画布' : '展开画布'} title={expanded ? '收起画布（Esc）' : '展开画布'}>
                <svg viewBox="0 0 20 20" aria-hidden="true">{expanded ? <path d="M7 3v4H3m10-4v4h4M7 17v-4H3m10 4v-4h4" /> : <path d="M3 7h4V3m10 4h-4V3M3 13h4v4m10-4h-4v4" />}</svg>
              </button>
            </div>
          </header>

          <div className="gen2-stage">
            {hasResult && !busy ? (
              <div className="gen2-artboard">
                {state.generatedSvg && <div className="result-svg" dangerouslySetInnerHTML={{ __html: state.generatedSvg }} />}
                {state.generatedImage && <img src={state.generatedImage} alt="生成结果" />}
              </div>
            ) : (
              <div className="gen2-empty">
                {busy ? <span className="gen2-spinner" aria-hidden="true" /> : (
                  <svg className="gen2-empty-art" viewBox="0 0 240 150" aria-hidden="true">
                    <path d="M70 75h36m28 0h36" />
                    <rect x="18" y="52" width="52" height="46" rx="7" />
                    <rect x="106" y="24" width="28" height="102" rx="7" />
                    <rect x="170" y="52" width="52" height="46" rx="7" />
                    <path d="M31 66h26M31 76h18M119 40v22m0 10v16m0 10v12M183 66h26m-26 10h18" />
                    <circle cx="88" cy="75" r="3" /><circle cx="152" cy="75" r="3" />
                  </svg>
                )}
                <h4>{busy ? '正在构建你的图示' : '从这里开始创作'}</h4>
                <p>{busy ? '论文内容会逐步整理为图形与文字。' : '生成后可预览、下载，或继续转为可编辑 PPTX。'}</p>
              </div>
            )}
          </div>

          <footer className="gen2-canvas-footer">
            <span>{mode === 'svg' ? '矢量输出，适合继续编辑' : '高清位图，适合快速展示'}</span>
            {hasResult && !busy && <button className="gen2-next" onClick={() => setStep(3)}>转可编辑 PPTX<ArrowIcon /></button>}
          </footer>
        </section>
      </div>
    </div>
  )
}
