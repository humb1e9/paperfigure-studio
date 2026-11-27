import { useSyncExternalStore } from 'react'
import type { ApiConfig } from '../types'

const STORAGE_KEY = 'ff_api_config'

const defaultConfig: ApiConfig = {
  provider: 'custom',
  baseUrl: '',
  apiKey: '',
  parseModel: '',
  generateModel: '',
  reconstructModel: '',
  imageModel: '',
  imageApiKey: ''
}

function load(): ApiConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig
  } catch {
    return defaultConfig
  }
}

// 模块级共享：设置抽屉改完，其他组件立即看到
let config = load()
const listeners = new Set<() => void>()

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

function setConfig(updates: Partial<ApiConfig>) {
  config = { ...config, ...updates }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  listeners.forEach(l => l())
}

export function useApiConfig() {
  const c = useSyncExternalStore(subscribe, () => config)
  const isConfigured = Boolean(c.baseUrl && c.apiKey && c.parseModel)
  return { config: c, setConfig, isConfigured }
}
