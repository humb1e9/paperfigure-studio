import { useState, useEffect } from 'react'
import { useSearch } from '../lib/useSearch'
import type { Figure } from '../types'
import './Gallery.css'

declare global {
  interface Window {
    FIGURES: Figure[]
  }
}

export default function Gallery() {
  const [figures, setFigures] = useState<Figure[]>([])
  const [venueFilter, setVenueFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const { query, setQuery, results } = useSearch(figures)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/assets/figures.js'
    script.onload = () => {
      setFigures(window.FIGURES || [])
      setLoading(false)
    }
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const venues = ['all', ...new Set(figures.map(f => f.venue))]
  const years = ['all', ...new Set(figures.map(f => f.year.toString()))].sort((a, b) => b.localeCompare(a))

  const filtered = results.filter(f => {
    if (venueFilter !== 'all' && f.venue !== venueFilter) return false
    if (yearFilter !== 'all' && f.year.toString() !== yearFilter) return false
    return true
  })

  if (loading) {
    return <div className="gallery-loading">加载中...</div>
  }

  return (
    <div className="gallery">
      <div className="gallery-header">
        <h2>{figures.length.toLocaleString()} 张顶会主图</h2>
        <p className="subtitle">CVPR · ICCV · ECCV · NeurIPS · ICLR · ICML · AAAI · ACL</p>
      </div>

      <div className="gallery-filters">
        <input
          type="search"
          placeholder="搜索标题、作者..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="search-input"
        />
        <select value={venueFilter} onChange={e => setVenueFilter(e.target.value)} className="filter-select">
          {venues.map(v => <option key={v} value={v}>{v === 'all' ? '全部会议' : v.toUpperCase()}</option>)}
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="filter-select">
          {years.map(y => <option key={y} value={y}>{y === 'all' ? '全部年份' : y}</option>)}
        </select>
        <span className="result-count">{filtered.length} 张</span>
      </div>

      <div className="gallery-grid">
        {filtered.slice(0, 60).map(f => (
          <div key={f.id} className="figure-card">
            <img src={`/${f.image}`} alt={f.title} loading="lazy" />
            <div className="figure-info">
              <h3>{f.title}</h3>
              <div className="figure-meta">
                <span className="venue">{f.venue.toUpperCase()}</span>
                <span className="year">{f.year}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
