import { useState, useEffect, useRef } from 'react'
import './SoundBath.css'
import { getAudioGenerator } from '../utils/AudioGenerator'

type Brainwave = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma'

const BRAINWAVE_PRESETS: Record<Brainwave, { hz: number; label: string; desc: string }> = {
  delta: { hz: 2, label: 'Delta', desc: 'Deep sleep, recovery' },
  theta: { hz: 6, label: 'Theta', desc: 'Meditation, dreaming, memory' },
  alpha: { hz: 10, label: 'Alpha', desc: 'Relaxation, light meditation' },
  beta: { hz: 20, label: 'Beta', desc: 'Focus, alertness, thinking' },
  gamma: { hz: 40, label: 'Gamma', desc: 'High cognition, insight' },
}

export function SoundBath() {
  const [active, setActive] = useState(false)
  const [brainwave, setBrainwave] = useState<Brainwave>('theta')
  const [volume, setVolume] = useState(0.3)
  const [baseFreq, setBaseFreq] = useState(432)
  const audioGenRef = useRef<ReturnType<typeof getAudioGenerator> | null>(null)

  const initAudio = () => {
    if (!audioGenRef.current) {
      audioGenRef.current = getAudioGenerator({ volume })
    }
    audioGenRef.current.init()
  }

  useEffect(() => {
    if (active) {
      initAudio()
      audioGenRef.current?.startBinaural(baseFreq, BRAINWAVE_PRESETS[brainwave].hz)
    } else {
      audioGenRef.current?.stopAll()
    }
  }, [active, brainwave, baseFreq])

  useEffect(() => {
    if (audioGenRef.current) {
      audioGenRef.current.setVolume(volume)
    }
  }, [volume])

  const current = BRAINWAVE_PRESETS[brainwave]

  return (
    <div className="soundbath">
      <div className="soundbath-header">
        <h3>🎧 Sound Sheet</h3>
        <p className="soundbath-sub">Binaural beats — brainwave tuning</p>
      </div>

      {!active ? (
        <div className="soundbath-start">
          <div className="brainwave-selector">
            {(Object.keys(BRAINWAVE_PRESETS) as Brainwave[]).map((bw) => {
              const preset = BRAINWAVE_PRESETS[bw]
              return (
                <button
                  key={bw}
                  className={`brainwave-btn ${brainwave === bw ? 'active' : ''}`}
                  onClick={() => setBrainwave(bw)}
                >
                  <span className="brainwave-label">{preset.label}</span>
                  <span className="brainwave-hz">{preset.hz} Hz</span>
                </button>
              )
            })}
          </div>

          <div className="soundbath-info">
            <div className="soundbath-info-desc">{current.desc}</div>
            <div className="soundbath-info-freq">
              <span className="soundbath-freq-label">Base</span>
              <span className="soundbath-freq-value">{baseFreq} Hz</span>
              <span className="soundbath-freq-sep">+</span>
              <span className="soundbath-beat-value">{current.hz} Hz</span>
              <span className="soundbath-beat-label">beat</span>
            </div>
          </div>

          <div className="soundbath-controls">
            <div className="soundbath-base-control">
              <label>Base tone</label>
              <div className="soundbath-base-btns">
                {[396, 432, 528].map((f) => (
                  <button
                    key={f}
                    className={`base-btn ${baseFreq === f ? 'active' : ''}`}
                    onClick={() => setBaseFreq(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="audio-volume-control">
              <label>🔊 {Math.round(volume * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="soundbath-visual">
            <div className="beat-indicator" data-wave={brainwave}>
              <div className="beat-ring" />
              <div className="beat-ring" />
              <div className="beat-ring" />
              <span className="beat-hz">{current.hz} Hz</span>
            </div>
          </div>

          <button
            className="soundbath-start-btn"
            onClick={() => setActive(true)}
          >
            Start
          </button>
        </div>
      ) : (
        <div className="soundbath-active">
          <div className="soundbath-active-visual">
            <div className="beat-indicator active" data-wave={brainwave}>
              <div className="beat-ring r1" />
              <div className="beat-ring r2" />
              <div className="beat-ring r3" />
              <span className="beat-label">{current.label}</span>
              <span className="beat-hz">{current.hz} Hz binaural</span>
            </div>
          </div>

          <div className="soundbath-active-info">
            <p>{current.desc}</p>
            <p className="soundbath-active-freq">
              {baseFreq} Hz links — {baseFreq + current.hz} Hz rechts
            </p>
          </div>

          <div className="soundbath-active-waves">
            <button
              className={`wave-change-btn ${brainwave === 'delta' ? 'active' : ''}`}
              onClick={() => setBrainwave('delta')}
            >Δ</button>
            <button
              className={`wave-change-btn ${brainwave === 'theta' ? 'active' : ''}`}
              onClick={() => setBrainwave('theta')}
            >θ</button>
            <button
              className={`wave-change-btn ${brainwave === 'alpha' ? 'active' : ''}`}
              onClick={() => setBrainwave('alpha')}
            >α</button>
            <button
              className={`wave-change-btn ${brainwave === 'beta' ? 'active' : ''}`}
              onClick={() => setBrainwave('beta')}
            >β</button>
            <button
              className={`wave-change-btn ${brainwave === 'gamma' ? 'active' : ''}`}
              onClick={() => setBrainwave('gamma')}
            >γ</button>
          </div>

          <button
            className="soundbath-stop-btn"
            onClick={() => setActive(false)}
          >
            Stop
          </button>
        </div>
      )}
    </div>
  )
}