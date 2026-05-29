import { useState, useEffect, useRef } from 'react'
import './Calibration.css'
import { getAudioGenerator } from '../utils/AudioGenerator'

interface CalibrationProps {
  onComplete: () => void
  onCancel: () => void
}

type CalibrationState = 'intro' | 'guidance' | 'confirming' | 'ready'

const GUIDANCE_STEPS = [
  { id: 'neutral', label: 'Start Neutral', instruction: 'Sit upright, head straight, shoulders relaxed' },
  { id: 'forward', label: 'Lean Forward', instruction: 'Bend slowly forward until it sounds harmonious' },
  { id: 'back', label: 'Lean Back', instruction: 'Lean gently backward to feel' },
  { id: 'left', label: 'Turn Left', instruction: 'Turn your head/body to the left' },
  { id: 'right', label: 'Turn Right', instruction: 'Turn to the right' },
  { id: 'center', label: 'Find Your Center', instruction: 'Move slowly until it sounds just right' },
]

export function Calibration({ onComplete, onCancel }: CalibrationProps) {
  const [state, setState] = useState<CalibrationState>('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [holdProgress, setHoldProgress] = useState(0)
  const [volume, setVolume] = useState(0.3)
  const audioGenRef = useRef<ReturnType<typeof getAudioGenerator> | null>(null)
  const holdInterval = useRef<number | null>(null)

  const currentStep = GUIDANCE_STEPS[stepIndex]

  const initAudio = () => {
    if (!audioGenRef.current) {
      audioGenRef.current = getAudioGenerator({ volume })
    }
    audioGenRef.current.init()
  }

  const startBinaural = () => {
    if (audioGenRef.current) {
      audioGenRef.current.startBinaural(432, 10) // 432 base + 10hz alpha beat
    }
  }

  const stopAudio = () => {
    if (audioGenRef.current) {
      audioGenRef.current.stopAll()
    }
  }

  useEffect(() => {
    if (audioGenRef.current) {
      audioGenRef.current.setVolume(volume)
    }
  }, [volume])

  const startGuidance = () => {
    initAudio()
    startBinaural()
    setState('guidance')
    setStepIndex(0)
  }

  const nextStep = () => {
    if (stepIndex < GUIDANCE_STEPS.length - 1) {
      setStepIndex(stepIndex + 1)
      setHoldProgress(0)
    } else {
      startConfirming()
    }
  }

  const startConfirming = () => {
    setState('confirming')
    setHoldProgress(0)
    
    holdInterval.current = window.setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          if (holdInterval.current) clearInterval(holdInterval.current)
          setState('ready')
          return 100
        }
        return prev + 2 // ~5 seconds total
      })
    }, 100)
  }

  useEffect(() => {
    return () => {
      if (holdInterval.current) clearInterval(holdInterval.current)
      stopAudio()
    }
  }, [])

  return (
    <div className="calibration">
      <div className="calibration-card">
        {state === 'intro' && (
          <>
            <div className="calibration-icon">⚖️</div>
            <h2>Calibration</h2>
            <p className="calibration-desc">
              The binaural field has a three-dimensional center. 
              Move your body to find your personal sweet spot.
            </p>
            <p className="calibration-note">
              This takes about 1 minute. Don't force anything — 
              let the sound guide you to the center.
            </p>
            <div className="calibration-volume">
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
            <div className="calibration-actions">
              <button className="calibration-start-btn" onClick={startGuidance}>
                Start Calibration
              </button>
              <button className="calibration-skip-btn" onClick={() => { stopAudio(); onCancel() }}>
                Skip
              </button>
            </div>
          </>
        )}

        {state === 'guidance' && (
          <>
            <div className="calibration-step-indicator">
              {GUIDANCE_STEPS.map((_, i) => (
                <span 
                  key={i} 
                  className={`step-dot ${i <= stepIndex ? 'active' : ''}`}
                />
              ))}
            </div>
            
            <div className="calibration-step-content">
              <span className="step-label">{currentStep.label}</span>
              <p className="step-instruction">{currentStep.instruction}</p>
            </div>

            <div className="calibration-visual">
              <div className="center-crosshair">
                <div className="crosshair-h" />
                <div className="crosshair-v" />
                <div className="crosshair-dot" />
              </div>
            </div>

            <div className="calibration-hint">
              ✨ When it feels harmonious, move to the next step
            </div>

            <div className="calibration-actions">
              <button className="calibration-next-btn" onClick={nextStep}>
                {stepIndex < GUIDANCE_STEPS.length - 1 ? 'Next →' : 'Done'}
              </button>
              <button className="calibration-back-btn" onClick={() => { stopAudio(); onCancel() }}>
                Cancel
              </button>
            </div>
          </>
        )}

        {state === 'confirming' && (
          <>
            <div className="calibration-icon">🎯</div>
            <h2>Find Your Center</h2>
            <p className="calibration-desc">
              Move until the loudest, most harmonious point. 
              Hold that position.
            </p>
            
            <div className="calibration-confirm-visual">
              <div className="confirm-ring outer" />
              <div className="confirm-ring middle" />
              <div className="confirm-ring inner" />
              <div className="confirm-center">
                {holdProgress > 0 && (
                  <div 
                    className="confirm-fill" 
                    style={{ height: `${holdProgress}%` }}
                  />
                )}
              </div>
            </div>

            <div className="calibration-hold-text">
              {holdProgress < 100 
                ? `Hold... ${Math.round(holdProgress)}%`
                : 'Perfect!'
              }
            </div>

            <button className="calibration-cancel-btn" onClick={() => {
              if (holdInterval.current) clearInterval(holdInterval.current)
              stopAudio()
              onCancel()
            }}>
              Cancel
            </button>
          </>
        )}

        {state === 'ready' && (
          <>
            <div className="calibration-icon">✨</div>
            <h2>Calibrated</h2>
            <p className="calibration-desc">
              Your center is found. Remember this position — 
              the meditation works best from this point.
            </p>
            
            <div className="calibration-ready-visual">
              <div className="ready-pulse" />
              <div className="ready-core" />
            </div>

            <div className="calibration-actions">
              <button className="calibration-start-btn" onClick={() => {
                stopAudio()
                onComplete()
              }}>
                Start Meditation
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
