import { useState, useMemo } from 'react'
import type { Figure, SearchResult } from '../types'

// 关键词检索：标题、作者、会议名。空格分隔的每个词都要命中，标题命中得分更高。
export function useSearch(figures: Figure[]) {
  const [query, setQuery] = useState('')

  const results = useMemo<SearchResult[]>(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return figures.map(f => ({ ...f, relevanceScore: 0 }))
    const out: SearchResult[] = []
    for (const f of figures) {
      const title = f.title.toLowerCase()
      const rest = `${f.authors.join(' ')} ${f.venue} ${f.year}`.toLowerCase()
      let score = 0
      for (const t of terms) {
        if (title.includes(t)) score += 2
        else if (rest.includes(t)) score += 1
        else { score = 0; break }
      }
      if (score) out.push({ ...f, relevanceScore: score })
    }
    return out.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }, [query, figures])

  return { query, setQuery, results }
}
