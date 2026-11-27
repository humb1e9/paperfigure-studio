import { useCallback, useRef, useState } from 'react'
import { useApiConfig } from './useApiConfig'
import type { ApiConfig } from '../types'

export interface RelatedPaper {
  id: string
  title: string
  year: number | null
  authors: string[]
  venue: string
  url: string
  pdf: string
  arxivId: string | null
  abstract: string
  figures?: PaperFigure[]
}

export interface PaperFigure {
  id: string
  figureNumber: number
  caption: string
  image: string
}

// 模型只负责从论文内容提炼检索词；真正的论文结果来自 OpenAlex，不由模型编造。
export async function deriveSearchTerms(c: ApiConfig, paper: string, signal?: AbortSignal): Promise<string> {
  if (!paper.trim()) throw new Error('请先填写论文内容')
  if (!c.baseUrl || !c.apiKey || !c.parseModel) throw new Error('请先在设置里配置 API 和解析模型')
  const response = await fetch(c.baseUrl.replace(/\/+$/, '') + '/chat/completions', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.apiKey}` },
    body: JSON.stringify({
      model: c.parseModel,
      max_tokens: 100,
      messages: [{ role: 'user', content: `根据下面的论文内容，提炼一组用于学术文献检索的英文关键词。聚焦研究任务、方法和应用领域，优先具体术语；只输出 4 至 8 个空格分隔的英文词或短语，不要编号、解释或标点列表。\n\n${paper.slice(0, 10000)}` }]
    })
  })
  if (!response.ok) throw new Error(`关键词接口 HTTP ${response.status}：${(await response.text()).slice(0, 160)}`)
  const data = await response.json()
  const query = String(data?.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/[\n\r]/g, ' ').trim().slice(0, 300)
  if (!query) throw new Error('模型没有返回检索关键词')
  return query
}

async function apiJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new Error('无法连接本地论文检索服务，请重启 npm run dev')
  }
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || `论文服务 HTTP ${response.status}`)
  return data
}

export function useRelatedPapers() {
  const { config } = useApiConfig()
  const [papers, setPapers] = useState<RelatedPaper[]>([])
  const [terms, setTerms] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const abort = useRef<AbortController | null>(null)

  const search = useCallback(async (paper: string) => {
    abort.current?.abort()
    const controller = new AbortController()
    abort.current = controller
    setBusy(true)
    setError('')
    try {
      const keywords = await deriveSearchTerms(config, paper, controller.signal)
      setTerms(keywords)
      setPapers(await apiJson<RelatedPaper[]>('/api/papers/search?q=' + encodeURIComponent(keywords), controller.signal))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setError(error instanceof Error ? error.message : '论文检索失败')
    } finally {
      if (abort.current === controller) setBusy(false)
    }
  }, [config])

  const cancel = useCallback(() => {
    abort.current?.abort()
    setBusy(false)
  }, [])

  const figures = useCallback((arxivId: string, signal?: AbortSignal) =>
    apiJson<PaperFigure[]>('/api/papers/figures?arxiv=' + encodeURIComponent(arxivId), signal), [])

  return { papers, terms, busy, error, search, cancel, figures }
}
