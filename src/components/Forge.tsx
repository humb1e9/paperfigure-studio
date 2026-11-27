import { useState } from 'react'
import { useForgeState } from '../lib/useForgeState'
import { useApiConfig } from '../lib/useApiConfig'
import Step2Refs from './Step2Refs'
import Step3Generate from './Step3Generate'
import Step4Export from './Step4Export'
import SettingsDrawer from './SettingsDrawer'
import './Forge.css'

export default function Forge() {
  const { state, setStep } = useForgeState()
  const { isConfigured } = useApiConfig()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="forge">
      <div className="forge-header">
        <div className="forge-steps">
          {[1, 2, 3].map(s => (
            <button
              key={s}
              className={`step-btn ${state.step === s ? 'active' : ''} ${state.step > s ? 'done' : ''}`}
              onClick={() => setStep(s as 1 | 2 | 3)}
            >
              <span className="step-num">{s}</span>
              <span className="step-label">
                {s === 1 && '选参考图'}
                {s === 2 && '生成初稿'}
                {s === 3 && '转 PPTX'}
              </span>
            </button>
          ))}
        </div>
        <button className="settings-btn" onClick={() => setShowSettings(true)}>
          ⚙️ 设置{isConfigured ? '' : '（未配置）'}
        </button>
      </div>

      <div className="forge-content">
        {state.step === 1 && <Step2Refs />}
        {state.step === 2 && <Step3Generate />}
        {state.step === 3 && <Step4Export />}
      </div>

      {showSettings && <SettingsDrawer onClose={() => setShowSettings(false)} />}
    </div>
  )
}
