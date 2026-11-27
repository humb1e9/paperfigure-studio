// 增量整理一批“已确认顶会发表”的正文子图；来源为 arXiv HTML，发表信息由 OpenAlex 单篇核验。
process.env.NODE_USE_ENV_PROXY = '0'
const { mkdir, readFile, writeFile } = require('fs/promises')
const path = require('path')
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'assets', 'subfigures.js')
const IDS = ['1706.03762', '2103.00020', '2204.14198', '2304.08485', '2304.02643', '2302.05543', '2010.11929', '2103.14030', '2106.09685', '2006.11239', '2011.13456', '2301.12597', '2203.02155']
const VENUES = /neurips|neural information processing systems|\biclr\b|learning representations|\bicml\b|machine learning|\biccv\b|computer vision|\bcvpr\b|computer vision and pattern recognition|\bacl\b|computational linguistics|\baaai\b|artificial intelligence/i
const CACHE = path.join('D:\\kali-projects\\test\\tmp', 'subfigure-cache.json')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function main() {
  const { createPaperApi, paperFromOpenAlex } = await import('./paper-search.mjs')
  const api = createPaperApi()
  let cached = {}
  try { cached = JSON.parse(await readFile(CACHE, 'utf8')) } catch {}
  const papers = []
  for (const id of IDS) {
    try {
      let work = cached[id]
      if (!work) {
        const response = await fetch(`https://api.openalex.org/works/https://doi.org/10.48550/arxiv.${id}`, { signal: AbortSignal.timeout(25000) })
        if (!response.ok) throw new Error(`OpenAlex ${response.status}`)
        work = paperFromOpenAlex(await response.json())
        cached[id] = work
        await writeFile(CACHE, JSON.stringify(cached, null, 2))
        await sleep(1200)
      }
      if (!VENUES.test(work.venue)) {
        console.log('SKIP 未确认顶会:', id, work.venue)
        continue
      }
      const arxivId = work.arxivId || id
      const resolvedId = id
      const figures = await api.figures(resolvedId)
      papers.push({ ...work, arxivId, figures })
      console.log('OK', work.venue, work.title, figures.length)
      await sleep(1200)
    } catch (error) { console.error('ERROR', id, error.message) }
  }
  await mkdir(path.dirname(OUT), { recursive: true })
  await writeFile(OUT, 'window.SUBFIGURES = ' + JSON.stringify(papers, null, 2) + ';\n')
  console.log(`已写入 ${papers.length} 篇已核验顶会论文，${papers.reduce((sum, p) => sum + p.figures.length, 0)} 张正文图。`)
  try { require('fs').unlinkSync(CACHE) } catch {}
}
main().catch(error => { console.error(error); process.exitCode = 1 })
