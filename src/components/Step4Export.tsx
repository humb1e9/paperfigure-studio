import { useRef, useState } from 'react'
import { useForgeState } from '../lib/useForgeState'
import { useApiConfig } from '../lib/useApiConfig'
import { reconstructPptx, svgToPng, download } from '../lib/generate'
import './Step3Generate.css'
import './Step4Export.css'

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" /></svg>
}

function DownloadIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v9m-3-3 3 3 3-3M4 13v3h12v-3" /></svg>
}

export default function Step4Export() {
  const { state, setStep } = useForgeState()
  const { config, isConfigured } = useApiConfig()
  const [upload, setUpload] = useState<string | null>(null)
  const [uploadName, setUploadName] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [pptx, setPptx] = useState<Blob | null>(null)
  const [count, setCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const source = upload || state.generatedImage || null
  const svg = !upload ? state.generatedSvg : null
  const hasImage = !!(source || svg)

  const onFile = (f?: File) => {
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      setUpload(String(r.result))
      setUploadName(f.name)
      setPptx(null)
      setCount(0)
      setMsg('')
      setErr('')
    }
    r.readAsDataURL(f)
  }

  const useDraft = () => {
    setUpload(null)
    setUploadName('')
    setPptx(null)
    setCount(0)
    setMsg('')
    setErr('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const run = async () => {
    setErr(''); setPptx(null); setCount(0); setBusy(true)
    const ac = new AbortController()
    abortRef.current = ac
    try {
      const src = source || (svg ? await svgToPng(svg, 1600) : null)
      if (!src) throw new Error('没有可重建的图片：请先在第 2 步生成，或上传一张图')
      setMsg('看图模型正在识别模块、箭头和文字，通常需要 1–3 分钟…')
      const { blob, count } = await reconstructPptx(config, src, ac.signal)
      setPptx(blob)
      setCount(count)
      setMsg(`重建完成：${count} 个可编辑对象`)
    } catch (e) {
      setMsg('')
      setErr(ac.signal.aborted ? '已取消' : e instanceof Error ? e.message : '重建失败')
    } finally {
      setBusy(false); abortRef.current = null
    }
  }

  return (
    <div className="step-panel export2">
      <div className="gen2-grid export2-grid">
        <section className="gen2-form export2-form" aria-labelledby="export2-title">
          <header className="gen2-heading">
            <h2 id="export2-title">转可编辑 PPTX</h2>
            <p>把图中的形状、箭头和文字重建为 PowerPoint 对象，方便继续修改。</p>
          </header>

          <section className="export2-source" aria-labelledby="export2-source-title">
            <div className="gen2-label-row">
              <h3 id="export2-source-title">图片来源</h3>
              <span>{upload ? '已上传' : hasImage ? '第 2 步初稿' : '未选择'}</span>
            </div>
            <p className="export2-source-name">{upload ? uploadName : hasImage ? (svg ? 'SVG 矢量初稿' : '生成的位图初稿') : '从第 2 步带入，或选择本地图片'}</p>
            <div className="export2-file-actions">
              <button className="export2-link" onClick={() => fileRef.current?.click()} disabled={busy}>上传其他图片</button>
              {upload && <button className="export2-link" onClick={useDraft} disabled={busy}>改用第 2 步结果</button>}
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => onFile(e.target.files?.[0])} />
          </section>

          <section className="export2-format" aria-label="导出格式">
            <div className="gen2-label-row"><h3>导出格式</h3></div>
            <div className="export2-format-row">
              <span className="export2-filetype">PPTX</span>
              <div><strong>PowerPoint 演示文稿</strong><p>形状、线条和文字均可编辑</p></div>
            </div>
            {svg && <button className="export2-link export2-svg-link" onClick={() => download(new Blob([svg], { type: 'image/svg+xml' }), 'figure.svg')}>原图为 SVG，也可直接下载</button>}
          </section>

          <div className="export2-note">
            <h3>重建说明</h3>
            <p>复杂渐变、阴影或细小装饰可能需要导出后手动微调。文字与基础形状会尽量保留。</p>
          </div>

          <div className="gen2-actions export2-actions">
            {!isConfigured && <p className="export2-config-note">请先在右上角「设置」配置 API。</p>}
            {busy ? (
              <button className="gen2-go gen2-cancel" onClick={() => abortRef.current?.abort()}>取消重建</button>
            ) : (
              <button className="gen2-go" onClick={run} disabled={!isConfigured || !hasImage}>
                {pptx ? '重新重建' : '开始重建'}<ArrowIcon />
              </button>
            )}
            {pptx && !busy && <button className="export2-download" onClick={() => download(pptx, 'figure.pptx')}><DownloadIcon />下载 PPTX</button>}
            <button className="export2-back" onClick={() => setStep(2)} disabled={busy}>返回第 2 步</button>
            {busy && <p className="generate-status" role="status">{msg}</p>}
            {err && <div className="error-message" role="alert">{err}</div>}
          </div>
        </section>

        <section className="gen2-canvas export2-canvas" aria-labelledby="export2-preview-title">
          <header className="gen2-canvas-bar">
            <div className="gen2-canvas-title">
              <h3 id="export2-preview-title">图片预览</h3>
              <span className={pptx ? 'is-ready' : ''}>{busy ? '重建中' : pptx ? 'PPTX 已就绪' : hasImage ? '待重建' : '等待图片'}</span>
            </div>
            {pptx && !busy && <button className="export2-canvas-download" onClick={() => download(pptx, 'figure.pptx')}><DownloadIcon />PPTX</button>}
          </header>

          <div className="gen2-stage export2-stage">
            {hasImage ? (
              <div className="gen2-artboard export2-artboard">
                {svg ? <div className="result-svg" dangerouslySetInnerHTML={{ __html: svg }} /> : <img src={source!} alt="待重建图片" />}
              </div>
            ) : (
              <div className="gen2-empty">
                <svg className="export2-empty-art" viewBox="0 0 200 160" aria-hidden="true">
                  <rect x="38" y="30" width="124" height="92" rx="7" />
                  <path d="M38 55h124M54 43h3m8 0h3m8 0h3M56 73h44m-44 12h70m-70 12h52" />
                  <rect x="116" y="71" width="28" height="28" rx="4" />
                  <path d="M122 93l6-7 5 4 5-8" />
                </svg>
                <h4>准备一张需要编辑的图</h4>
                <p>先在第 2 步生成初稿，或上传本地图片，再开始重建。</p>
                <button className="export2-empty-action" onClick={() => setStep(2)}>去第 2 步生成</button>
              </div>
            )}
          </div>

          <footer className="gen2-canvas-footer">
            <span>{busy ? '正在识别图片，请保持此页面打开' : pptx ? `已生成 ${count} 个可编辑对象` : '导出后可在 PowerPoint 中继续编辑'}</span>
            {pptx && !busy && <button className="gen2-next" onClick={() => download(pptx, 'figure.pptx')}>下载 PPTX<DownloadIcon /></button>}
          </footer>
        </section>
      </div>
    </div>
  )
}
