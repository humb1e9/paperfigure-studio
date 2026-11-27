import { useState, useEffect, useRef, useMemo } from 'react'
import { useForgeState, MAX_REFS } from '../lib/useForgeState'
import { useSearch } from '../lib/useSearch'
import { toDataUri } from '../lib/generate'
import { useRelatedPapers, type PaperFigure, type RelatedPaper } from '../lib/useRelatedPapers'
import type { Figure } from '../types'
import './Step2Refs.css'

declare global {
  interface Window { FIGURES: Figure[]; SUBFIGURES?: RelatedPaper[] }
}

const PAGE = 50

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" /></svg>
}

export default function Step2Refs() {
  const { state, setStep, setPaperText, addRef, removeRef } = useForgeState()
  const [figures, setFigures] = useState<Figure[]>([])
  const { query, setQuery, results } = useSearch(figures)
  const [venue, setVenue] = useState('')
  const [year, setYear] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const [msg, setMsg] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [localSubfigures, setLocalSubfigures] = useState<RelatedPaper[]>([])
  const [localFigureFilter, setLocalFigureFilter] = useState<'subfigures' | 'main'>('subfigures')
  const [subQuery, setSubQuery] = useState('')
  const [source, setSource] = useState<'related' | 'gallery'>('related')
  const [paper, setPaper] = useState<RelatedPaper | null>(null)
  const [paperFigures, setPaperFigures] = useState<PaperFigure[]>([])
  const [figuresBusy, setFiguresBusy] = useState(false)
  const related = useRelatedPapers()
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (window.FIGURES) return setFigures(window.FIGURES)
    const script = document.createElement('script')
    script.src = '/assets/figures.js'
    script.onload = () => setFigures(window.FIGURES || [])
    document.head.appendChild(script)
  }, [])

  const venues = useMemo(() => [...new Set(figures.map(f => f.venue))].sort(), [figures])
  const years = useMemo(() => [...new Set(figures.map(f => f.year))].sort((a, b) => b - a), [figures])
  const papers = results.filter(f => (!venue || f.venue === venue) && (!year || String(f.year) === year))
  useEffect(() => setLimit(PAGE), [query, venue, year])
  const full = state.refs.length >= MAX_REFS
  const localFigures = localSubfigures.flatMap(p => p.figures?.map(f => ({ ...f, paper: p })) || []).filter(f => {
    const q = subQuery.trim().toLowerCase()
    return !q || `${f.caption} ${f.paper.title} ${f.paper.venue}`.toLowerCase().includes(q)
  })

  useEffect(() => {
    if (window.SUBFIGURES) return setLocalSubfigures(window.SUBFIGURES)
    const script = document.createElement('script')
    script.src = '/assets/subfigures.js'
    script.onload = () => setLocalSubfigures(window.SUBFIGURES || [])
    script.onerror = () => setMsg('本地子图库尚未生成，可使用在线论文检索')
    document.head.appendChild(script)
  }, [])

  const addFiles = async (files: File[]) => {
    const imgs = files.filter(f => f.type.startsWith('image/'))
    if (!imgs.length) return
    setMsg('')
    let added = 0
    for (const file of imgs) {
      if (state.refs.length + added >= MAX_REFS) break
      const url = URL.createObjectURL(file)
      try {
        const { uri } = await toDataUri(url, 1024)
        addRef({ id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, uri, label: file.name || '截图' })
        added++
      } catch {
        setMsg('图片读取失败：' + file.name)
      } finally {
        URL.revokeObjectURL(url)
      }
    }
  }

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = [...(e.clipboardData?.files || [])]
      if (!files.some(f => f.type.startsWith('image/'))) return
      e.preventDefault()
      addFiles(files)
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  })

  const addFigure = async (id: string, image: string, label: string) => {
    if (full || state.refs.some(r => r.id === id)) return
    try {
      setMsg('')
      const { uri } = await toDataUri(image, 1024)
      addRef({ id, uri, label })
    } catch {
      setMsg('子图加载失败，请稍后重试或上传截图')
    }
  }

  const addMainFigure = (f: Figure) => addFigure(f.id, `/${f.image}`, `${f.venue.toUpperCase()} ${f.year} 主图`)

  const { figures: loadFigures } = related
  const openPaper = async (p: RelatedPaper) => {
    if (!p.arxivId) return
    setPaper(p)
    setPaperFigures([])
    setFiguresBusy(true)
    try {
      setPaperFigures(await loadFigures(p.arxivId))
    } catch (error) {
      setMsg(error instanceof Error ? error.message : '正文子图读取失败')
    } finally {
      setFiguresBusy(false)
    }
  }

  const activeRelatedFigures = paper?.figures || paperFigures

  return (
    <div className="step-panel refs-panel">
      <div className="refs-workbench">
        <section className="refs-selection" aria-labelledby="refs-title">
          <header className="refs-heading">
            <h2 id="refs-title">选参考图</h2>
            <p>选一张喜欢的学术图作为风格参考，模型会自动提取配色与布局。</p>
          </header>

          <div className="refs-selection-head">
            <h3>已选图片 <span>{state.refs.length} / {MAX_REFS}</span></h3>
            <button className="refs-upload" onClick={() => fileRef.current?.click()} disabled={full}>上传图片</button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => { addFiles([...(e.target.files || [])]); e.target.value = '' }} />
          </div>

          <div className={`refs-drop${state.refs.length ? '' : ' empty'}`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles([...e.dataTransfer.files]) }}>
            {state.refs.length === 0 && (
              <div className="refs-drop-empty">
                <svg viewBox="0 0 180 130" aria-hidden="true">
                  <rect x="33" y="24" width="114" height="80" rx="7" />
                  <circle cx="62" cy="50" r="8" />
                  <path d="M44 92l28-25 18 15 20-22 26 32M61 114h58" />
                </svg>
                <h4>添加你的参考图</h4>
                <p>Ctrl+V 粘贴截图，或把图片拖到这里</p>
              </div>
            )}
            {state.refs.map(r => (
              <figure key={r.id} className="ref-thumb">
                <button className="ref-preview" onClick={() => setPreview(r.uri)} aria-label={`预览 ${r.label}`}><img src={r.uri} alt={r.label} /></button>
                <figcaption title={r.label}>{r.label}</figcaption>
                <button className="ref-remove" onClick={() => removeRef(r.id)} aria-label={`移除 ${r.label}`}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg></button>
              </figure>
            ))}
          </div>
          {msg && <div className="error-message" role="alert">{msg}</div>}

          <div className="refs-help">
            <h3>如何使用参考图</h3>
            <ol>
              <li><span>1</span><p>填写论文内容，检索相关论文，再打开<strong>正文子图</strong>。</p></li>
              <li><span>2</span><p>也可浏览本地图库，或按 <kbd>Ctrl</kbd> + <kbd>V</kbd> 粘贴截图。</p></li>
              <li><span>3</span><p>参考图是可选的，不选也可以直接生成。</p></li>
            </ol>
          </div>

          <div className="refs-next-wrap">
            <p>{state.refs.length ? `已选择 ${state.refs.length} 张，生成时将自动分析风格` : '可以跳过选图，使用默认学术插图风格'}</p>
            <button className="refs-next" onClick={() => setStep(2)}>下一步：生成初稿<ArrowIcon /></button>
          </div>
        </section>

        <section className="refs-browser" aria-labelledby="paper-browser-title">
          <div className="refs-source-tabs" aria-label="参考图来源">
            <button className={source === 'related' ? 'active' : ''} onClick={() => { setSource('related'); setPaper(null) }}>按论文检索</button>
            <button className={source === 'gallery' ? 'active' : ''} onClick={() => setSource('gallery')}>本地顶会图库</button>
          </div>
          {source === 'related' && <>
            <div className="related-query">
              <label htmlFor="related-paper">论文内容</label>
              <textarea id="related-paper" value={state.paperText} onChange={e => setPaperText(e.target.value)} placeholder="粘贴摘要、方法或研究问题，模型会据此提炼英文关键词并检索相关论文…" />
              <div className="related-query-actions"><span>不限会议 · OpenAlex 检索 · arXiv 正文子图</span><button onClick={() => related.busy ? related.cancel() : related.search(state.paperText)} disabled={!related.busy && !state.paperText.trim()}>{related.busy ? '取消检索' : '找相关论文'}</button></div>
              {related.terms && <p className="related-terms">检索词：{related.terms}</p>}
              {related.error && <div className="error-message" role="alert">{related.error}</div>}
            </div>
            <div className="related-content">
              {paper ? <>
                <div className="related-paper-head"><button onClick={() => setPaper(null)}>← 相关论文</button><span>正文编号图与图注</span></div>
                <h4 className="related-paper-title">{paper.title}</h4>
                {figuresBusy ? <div className="refs-no-results"><h4>正在读取正文子图…</h4></div> : activeRelatedFigures.length ? <ul className="related-figure-list">{activeRelatedFigures.map(f => <li key={f.id} className={state.refs.some(r => r.id === f.id) ? 'is-added' : ''}>
                  <button className="related-figure-preview" onClick={() => setPreview(f.image)} aria-label={`预览 Figure ${f.figureNumber}`}><img src={f.image} alt={`Figure ${f.figureNumber}: ${f.caption}`} /></button>
                  <div><strong>Figure {f.figureNumber}</strong><p>{f.caption}</p><button className="paper-add" onClick={() => addFigure(f.id, f.image, `${paper.title} · Figure ${f.figureNumber}`)} disabled={full || state.refs.some(r => r.id === f.id)}>{state.refs.some(r => r.id === f.id) ? '已添加' : '选为参考图'}</button></div>
                </li>)}</ul> : <div className="refs-no-results"><h4>未找到可读取的正文子图</h4><p>这篇论文可能没有 arXiv HTML，可打开 PDF 截图粘贴。</p><a href={paper.pdf || paper.url} target="_blank" rel="noreferrer">打开论文</a></div>}
              </> : related.papers.length ? <ul className="related-paper-list">{related.papers.map(p => <li key={p.id}>
                <div className="paper-tags"><span>{p.venue}</span><span>{p.year || '年份未知'}</span>{p.arxivId && <span>arXiv</span>}</div>
                <h4>{p.title}</h4><p className="related-authors">{p.authors.slice(0, 3).join(', ')}</p>
                {p.abstract && <p className="related-abstract">{p.abstract.slice(0, 240)}{p.abstract.length > 240 ? '…' : ''}</p>}
                <div className="paper-links"><a href={p.url} target="_blank" rel="noreferrer">论文页</a>{p.pdf && <a href={p.pdf} target="_blank" rel="noreferrer">PDF</a>}<button className="paper-add" onClick={() => openPaper(p)} disabled={!p.arxivId}>{p.arxivId ? '查看正文子图' : '暂无可读取子图'}</button></div>
              </li>)}</ul> : !related.busy && <div className="refs-no-results"><h4>从你的论文内容出发</h4><p>不必知道论文标题。填写研究内容后，先找相关论文，再选其中的 Figure 2、Figure 3 等正文子图。</p></div>}
            </div>
          </>}
          {source === 'gallery' && <>
          <div className="local-figure-tabs"><button className={localFigureFilter === 'subfigures' ? 'active' : ''} onClick={() => setLocalFigureFilter('subfigures')}>正文子图 <span>{localFigures.length}</span></button><button className={localFigureFilter === 'main' ? 'active' : ''} onClick={() => setLocalFigureFilter('main')}>主图库 <span>{papers.length}</span></button></div>
          {localFigureFilter === 'subfigures' ? <>
            <div className="local-subfigure-search"><input aria-label="搜索正文子图" placeholder="搜索图注、论文或会议…" value={subQuery} onChange={e => setSubQuery(e.target.value)} /><span>顶会发表来源已核验 · 原图注保留</span></div>
            {localFigures.length ? <ul className="related-figure-list local-subfigure-list">{localFigures.map(f => <li key={f.id} className={state.refs.some(r => r.id === f.id) ? 'is-added' : ''}>
              <button className="related-figure-preview" onClick={() => setPreview(f.image)} aria-label={`预览 ${f.paper.title} Figure ${f.figureNumber}`}><img src={f.image} alt={`Figure ${f.figureNumber}: ${f.caption}`} loading="lazy" /></button>
              <div><div className="paper-tags"><span>{f.paper.venue}</span><span>{f.paper.year}</span></div><strong>{f.paper.title}</strong><b>Figure {f.figureNumber}</b><p>{f.caption}</p><div className="paper-links"><a href={f.paper.url} target="_blank" rel="noreferrer">论文页</a><button className="paper-add" onClick={() => addFigure(f.id, f.image, `${f.paper.title} · Figure ${f.figureNumber}`)} disabled={full || state.refs.some(r => r.id === f.id)}>{state.refs.some(r => r.id === f.id) ? '已添加' : '选为参考图'}</button></div></div>
            </li>)}</ul> : <div className="refs-no-results"><h4>没有匹配的子图</h4><p>尝试搜索图注关键词，或切换到按论文检索。</p></div>}
          </> : <>
          <header className="refs-browser-head">
            <div><h3 id="paper-browser-title">论文图库</h3><span>{papers.length.toLocaleString()} 篇论文</span></div>
            <label className="refs-search"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5" /><path d="m12 12 4 4" /></svg><input className="search-input" aria-label="搜索论文" placeholder="搜索标题或作者…" value={query} onChange={e => setQuery(e.target.value)} /></label>
          </header>

          <div className="refs-filter-row">
            <select aria-label="按会议筛选" value={venue} onChange={e => setVenue(e.target.value)}><option value="">全部会议</option>{venues.map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}</select>
            <select aria-label="按年份筛选" value={year} onChange={e => setYear(e.target.value)}><option value="">全部年份</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
            {(query || venue || year) && <button className="refs-clear" onClick={() => { setQuery(''); setVenue(''); setYear('') }}>清除筛选</button>}
          </div>

          <div className="refs-result-count"><span>按相关度浏览</span><span>已显示 {Math.min(limit, papers.length)} 篇</span></div>
          {papers.length ? (
            <ul className="paper-list">
              {papers.slice(0, limit).map(f => (
                <li key={f.id} className={`paper-row${state.refs.some(r => r.id === f.id) ? ' is-added' : ''}`}>
                  <button className="paper-preview" onClick={() => setPreview(`/${f.image}`)} aria-label={`预览 ${f.title}`}><img src={`/${f.image}`} alt="" loading="lazy" /></button>
                  <div className="paper-meta">
                    <div className="paper-tags"><span>{f.venue.toUpperCase()}</span><span>{f.year}</span></div>
                    <h4>{f.title}</h4>
                    <span className="paper-authors">{f.authors.slice(0, 3).join(', ')}{f.authors.length > 3 ? ' 等' : ''}</span>
                    <div className="paper-links">
                      {f.pdf_source && <a href={f.pdf_source} target="_blank" rel="noreferrer">PDF</a>}
                      {f.paper && <a href={f.paper} target="_blank" rel="noreferrer">论文页</a>}
                      <button className="paper-add" onClick={() => addMainFigure(f)} disabled={full || state.refs.some(r => r.id === f.id)}>{state.refs.some(r => r.id === f.id) ? '已添加' : '用主图'}</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="refs-no-results"><h4>没有找到匹配的论文</h4><p>试试缩短关键词，或清除会议和年份筛选。</p><button onClick={() => { setQuery(''); setVenue(''); setYear('') }}>清除筛选</button></div>
          )}
          {papers.length > limit && <button className="paper-more" onClick={() => setLimit(l => l + PAGE)}>再显示 {Math.min(PAGE, papers.length - limit)} 篇</button>}
          </>}
          </>}
        </section>
      </div>

      {preview && <div className="refs-lightbox" role="dialog" aria-modal="true" aria-label="参考图预览" onClick={() => setPreview(null)}><button onClick={() => setPreview(null)} aria-label="关闭预览"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg></button><img src={preview} alt="参考图大图预览" onClick={e => e.stopPropagation()} /></div>}
    </div>
  )
}
