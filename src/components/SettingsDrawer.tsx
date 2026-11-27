import { useApiConfig } from '../lib/useApiConfig'
import './SettingsDrawer.css'

interface Props {
  onClose: () => void
}

export default function SettingsDrawer({ onClose }: Props) {
  const { config, setConfig } = useApiConfig()

  return (
    <>
      <div className="drawer-mask" onClick={onClose} />
      <div className="settings-drawer">
        <div className="drawer-header">
          <h3>API 设置</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="drawer-content">
          <div className="form-group">
            <label>服务商</label>
            <select
              value={config.provider}
              onChange={e => setConfig({ provider: e.target.value as any })}
            >
              <option value="custom">自定义 / OpenAI 兼容</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          <div className="form-group">
            <label>接入地址</label>
            <input
              type="text"
              placeholder="https://api.openai.com/v1"
              value={config.baseUrl}
              onChange={e => setConfig({ baseUrl: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              value={config.apiKey}
              onChange={e => setConfig({ apiKey: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>解析模型</label>
            <input
              type="text"
              placeholder="gpt-4o"
              value={config.parseModel}
              onChange={e => setConfig({ parseModel: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>生成模型</label>
            <input
              type="text"
              placeholder="gpt-4o / dall-e-3"
              value={config.generateModel}
              onChange={e => setConfig({ generateModel: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>重建模型</label>
            <input
              type="text"
              placeholder="gpt-4o"
              value={config.reconstructModel}
              onChange={e => setConfig({ reconstructModel: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>图像模型（AI 位图用）</label>
            <input
              type="text"
              placeholder="gpt-image-2"
              value={config.imageModel}
              onChange={e => setConfig({ imageModel: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>图像模型 API Key（留空则用上面的 Key）</label>
            <input
              type="password"
              placeholder="sk-..."
              value={config.imageApiKey}
              onChange={e => setConfig({ imageApiKey: e.target.value })}
            />
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn-primary" onClick={onClose}>完成</button>
        </div>
      </div>
    </>
  )
}
