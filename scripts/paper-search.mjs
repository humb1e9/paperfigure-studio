const ARXIV_HOSTS = new Set(['arxiv.org', 'www.arxiv.org', 'export.arxiv.org'])

// Node 支持通过环境变量关闭自动系统代理；只影响本地论文服务进程。
process.env.NODE_USE_ENV_PROXY = '0'

export function extractArxivId(value) {
  try {
    const url = new URL(value)
    if (!ARXIV_HOSTS.has(url.hostname)) return null
    const match = url.pathname.match(/^\/(?:abs|pdf|html)\/([^/]+?)(?:\.pdf)?\/?$/)
    return match ? match[1] : null
  } catch {
    return /^\d{4}\.\d{4,5}(?:v\d+)?$/.test(value) ? value : null
  }
}

export function relatedSearchUrl(query) {
  const params = new URLSearchParams({ search: query, 'per-page': '8' })
  return 'https://api.openalex.org/works?' + params
}

export function paperFromOpenAlex(work) {
  const abstractWords = []
  for (const [word, indexes] of Object.entries(work.abstract_inverted_index || {})) {
    for (const index of indexes) abstractWords[index] = word
  }
  const locations = [work.primary_location, ...(work.locations || [])].filter(Boolean)
  const arxiv = locations.map(location => extractArxivId(location.landing_page_url || location.pdf_url || '')).find(Boolean)
  return {
    id: work.id,
    title: work.display_name || 'Untitled paper',
    year: work.publication_year || null,
    authors: (work.authorships || []).map(item => item.author?.display_name).filter(Boolean),
    venue: work.primary_location?.source?.display_name || '未标注来源',
    url: work.primary_location?.landing_page_url || work.doi || work.id,
    pdf: work.primary_location?.pdf_url || '',
    arxivId: arxiv || null,
    abstract: abstractWords.filter(Boolean).join(' ')
  }
}

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, entity) => {
    if (entity[0] === '#') return String.fromCodePoint(parseInt(entity.slice(entity[1]?.toLowerCase() === 'x' ? 2 : 1), entity[1]?.toLowerCase() === 'x' ? 16 : 10))
    return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[entity.toLowerCase()] || _
  })
}

function cleanText(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, ' ')).replace(/\s+([.,;:!?])/g, '$1').replace(/\s+/g, ' ').trim()
}

export function extractFigures(html, baseUrl) {
  const arxivId = extractArxivId(baseUrl)
  if (!arxivId) throw new Error('Only arXiv HTML is supported')
  const figures = []
  for (const match of html.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gi)) {
    const block = match[1]
    const image = block.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1]
    const rawCaption = block.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1] || ''
    const caption = cleanText(rawCaption.replace(/<span\b[^>]*class=["'][^"']*ltx_tag_figure[^"']*["'][^>]*>[\s\S]*?<\/span>/i, ''))
    const number = rawCaption.match(/(?:Figure|Fig\.?)\s*(\d+)/i)?.[1]
    if (!image || !number || !caption) continue
    const asset = new URL(decodeEntities(image), baseUrl.replace(/\/$/, '') + '/')
    if (!ARXIV_HOSTS.has(asset.hostname)) continue
    const prefix = '/html/'
    if (!asset.pathname.startsWith(prefix)) continue
    const assetPath = asset.pathname.slice(prefix.length)
    const separator = assetPath.indexOf('/')
    const resolvedId = separator > 0 ? assetPath.slice(0, separator) : arxivId
    const relativePath = assetPath.slice(separator + 1).split('/').map(part => encodeURIComponent(decodeURIComponent(part))).join('/')
    // arXiv 的图片路径有的已含版本目录，有的只是文件相对路径，不能重复拼接。
    const normalizedPath = relativePath.startsWith(`${resolvedId}/`) ? relativePath.slice(resolvedId.length + 1) : relativePath
    figures.push({
      id: `${arxivId}-fig${number}`,
      figureNumber: Number(number),
      caption,
      image: `/api/paper-assets/${encodeURIComponent(resolvedId)}/${normalizedPath}`
    })
  }
  return figures
}

export async function searchRelatedPapers(query, fetcher = fetch) {
  const response = await fetcher(relatedSearchUrl(query), { signal: AbortSignal.timeout(25_000) })
  if (!response.ok) {
    if (response.status === 429 || response.status === 403) return searchArxiv(query, fetcher)
    throw new Error(`OpenAlex HTTP ${response.status}`)
  }
  const data = await response.json()
  return (data.results || []).map(paperFromOpenAlex)
}

export function papersFromArxiv(xml) {
  return [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)].map(([, entry]) => {
    const value = tag => decodeEntities(entry.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))?.[1] || '').replace(/\s+/g, ' ').trim()
    const id = value('id')
    const arxivId = extractArxivId(id)
    return {
      id,
      title: value('title'),
      year: Number(value('published').slice(0, 4)) || null,
      authors: [...entry.matchAll(/<author\b[^>]*>[\s\S]*?<name\b[^>]*>([\s\S]*?)<\/name>[\s\S]*?<\/author>/gi)].map(m => decodeEntities(m[1]).trim()),
      venue: 'arXiv 预印本',
      url: id.replace('http://', 'https://'),
      pdf: `https://arxiv.org/pdf/${arxivId}`,
      arxivId,
      abstract: value('summary')
    }
  }).filter(p => p.arxivId && p.title)
}

export async function searchArxiv(query, fetcher = fetch) {
  const params = new URLSearchParams({ search_query: `all:${query}`, start: '0', max_results: '8', sortBy: 'relevance' })
  const response = await fetcher(`https://export.arxiv.org/api/query?${params}`, { signal: AbortSignal.timeout(25_000) })
  if (!response.ok) throw new Error(`arXiv HTTP ${response.status}`)
  return papersFromArxiv(await response.text())
}

export async function getPaperFigures(arxivId, fetcher = fetch) {
  if (!extractArxivId(arxivId)) throw new Error('无效的 arXiv ID')
  const baseUrl = `https://arxiv.org/html/${encodeURIComponent(arxivId)}`
  const response = await fetcher(baseUrl, { signal: AbortSignal.timeout(25_000) })
  if (!response.ok) throw new Error(`这篇论文没有可用的 arXiv HTML（HTTP ${response.status}）`)
  let html = await response.text()
  let resolvedUrl = response.url || baseUrl
  if (!resolvedUrl.match(/v\d+/)) {
    const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]
    if (canonical && extractArxivId(canonical)) resolvedUrl = canonical
    else {
      const abs = await fetcher(`https://arxiv.org/abs/${encodeURIComponent(arxivId)}`, { signal: AbortSignal.timeout(25_000) })
      const version = abs.ok && (await abs.text()).match(/href=["']https:\/\/arxiv\.org\/html\/(\d{4}\.\d{4,5}v\d+)["']/i)?.[1]
      if (version) {
        resolvedUrl = `https://arxiv.org/html/${version}`
        html = await (await fetcher(resolvedUrl, { signal: AbortSignal.timeout(25_000) })).text()
      }
    }
  }
  return extractFigures(html, resolvedUrl)
}

export function createPaperApi(fetcher = fetch) {
  return {
    search: query => searchRelatedPapers(query, fetcher),
    figures: arxivId => getPaperFigures(arxivId, fetcher)
  }
}

export function paperAssetUrl(pathname) {
  const match = pathname.match(/^\/api\/paper-assets\/([^/]+)\/(.+)$/)
  if (!match) return null
  const arxivId = decodeURIComponent(match[1])
  if (!/^\d{4}\.\d{4,5}(?:v\d+)?$/.test(arxivId)) return null
  if (!match[2] || match[2].length > 2048) return null
  let path
  try { path = decodeURIComponent(match[2]) } catch { return null }
  if (path.split('/').some(part => !part || part === '.' || part === '..')) return null
  return `https://arxiv.org/html/${encodeURIComponent(arxivId)}/${path.split('/').map(encodeURIComponent).join('/')}`
}

export function createPaperApiPlugin(api = createPaperApi()) {
  return {
    name: 'related-paper-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost')
        if (!url.pathname.startsWith('/api/papers/') && !url.pathname.startsWith('/api/paper-assets/')) return next()
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'public, max-age=3600')
        try {
          let result
          if (url.pathname === '/api/papers/search') {
            const query = (url.searchParams.get('q') || '').trim()
            if (!query) return send(res, 400, { error: '请输入检索关键词' })
            result = await api.search(query)
          } else if (url.pathname === '/api/papers/figures') {
            result = await api.figures(url.searchParams.get('arxiv') || '')
          } else {
            const asset = paperAssetUrl(url.pathname)
            if (!asset) return send(res, 400, { error: '无效图片地址' })
            const response = await fetch(asset, { signal: AbortSignal.timeout(25_000) })
            if (!response.ok || !/^image\//i.test(response.headers.get('content-type') || '')) return send(res, 404, { error: '子图不存在' })
            const body = Buffer.from(await response.arrayBuffer())
            if (body.length > 12_000_000) return send(res, 413, { error: '图片过大' })
            res.setHeader('Content-Type', response.headers.get('content-type'))
            res.setHeader('Cache-Control', 'public, max-age=86400')
            res.statusCode = 200
            return res.end(body)
          }
          return send(res, 200, result)
        } catch (error) {
          return send(res, 502, { error: `论文服务暂时不可用：${error.message}` })
        }
      })
    }
  }
}

function send(res, status, body) {
  res.statusCode = status
  res.end(JSON.stringify(body))
}
