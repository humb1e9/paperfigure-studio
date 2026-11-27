// forge/*.mjs 是原项目的纯 JS 模块，这里只声明 React 端用到的部分。
declare module '@forge/*' {
  const value: any
  export default value
}
declare module '@forge/step3-svg-request.mjs' {
  export function requestStep3Svg(opts: {
    base: string
    modelBody: Record<string, unknown>
    key: string
    parseXML: (s: string) => Document
    signal?: AbortSignal
    onRetry?: (info: { attempt: number; nextAttempt: number; maxAttempts: number; error: Error }) => void
  }): Promise<{ code: string }>
}
declare module '@forge/image-api.mjs' {
  export function compatibleImageRequest(body: Record<string, unknown>, base?: string, provider?: string): { endpoint: string; body: Record<string, unknown> | FormData }
  export function requestImageWithRecovery(opts: {
    url: string
    body: Record<string, unknown> | FormData
    key: string
    usedReferences?: boolean
    allowReferenceFallback?: boolean
    onRecovery?: (kind: string) => void
  }): Promise<{ ok: boolean; status: number; text: string; usedReferences: boolean; referenceFallback: boolean }>
  export function fetchBufferedWithTimeout(url: string, options?: RequestInit, timeoutMs?: number): Promise<Response>
  export function imageFailureKind(status: number, text: string): string
}
declare module '@forge/reconstruction-core.mjs' {
  export function extractEditableNodes(raw: unknown): any[]
}
declare module '@forge/editable-native.mjs' {
  export function buildNativePptx(scene: any, zipStore: (files: { name: string; data: Uint8Array | string }[]) => Blob): Promise<Blob>
}
declare module '@forge/chat-api.mjs'
declare module '@forge/parser-model-catalog.mjs'
declare module '@forge/revision-task-store.mjs'
declare module '@forge/reconstruction-session.mjs'
