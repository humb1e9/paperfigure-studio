import { useSyncExternalStore } from 'react'

// 参考图：用户从论文 PDF 截图粘贴/上传，或直接用画廊里的主图
export interface RefImage {
  id: string
  uri: string // 已缩放的 data URI，直接发给模型
  label: string
}

export interface ForgeStepState {
  step: 1 | 2 | 3
  intent: string
  paperText: string
  refs: RefImage[]
  generating: boolean
  generatedSvg: string | null
  generatedImage: string | null
  error: string | null
}

export const MAX_REFS = 6

// 模块级共享 store：所有组件读写同一份状态
let state: ForgeStepState = {
  step: 1,
  intent: '',
  paperText: '',
  refs: [],
  generating: false,
  generatedSvg: null,
  generatedImage: null,
  error: null
}
const listeners = new Set<() => void>()

function update(fn: (prev: ForgeStepState) => ForgeStepState) {
  state = fn(state)
  listeners.forEach(l => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

const actions = {
  setStep: (step: 1 | 2 | 3) => update(p => ({ ...p, step, error: null })),
  setIntent: (intent: string) => update(p => ({ ...p, intent })),
  setPaperText: (paperText: string) => update(p => ({ ...p, paperText })),
  addRef: (ref: RefImage) =>
    update(p => (p.refs.length >= MAX_REFS || p.refs.some(r => r.id === ref.id) ? p : { ...p, refs: [...p.refs, ref] })),
  removeRef: (id: string) => update(p => ({ ...p, refs: p.refs.filter(r => r.id !== id) })),
  setGenerating: (generating: boolean) => update(p => ({ ...p, generating, error: null })),
  setResult: (svg: string | null, image: string | null) =>
    update(p => ({ ...p, generatedSvg: svg, generatedImage: image, generating: false })),
  setError: (error: string) => update(p => ({ ...p, error, generating: false }))
}

export function useForgeState() {
  const s = useSyncExternalStore(subscribe, () => state)
  return { state: s, ...actions }
}
