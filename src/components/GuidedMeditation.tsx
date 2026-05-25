import { useState, useEffect, useRef } from 'react'
import './GuidedMeditation.css'
import { getAudioGenerator } from '../utils/AudioGenerator'

interface MeditationStep {
  sefira: string
  symbol: string
  title: string
  text: string
  breath?: string
  frequency?: number
}

const PHASE_FREQUENCIES: Record<string, number[]> = {
  // Based on 432 Hz — tones that harmonize
  // 4-4-4: inhale-hold-exhale — centric, earthly
  '4-4-4': [216, 324, 432],
  // 6-4-6: longer inhale — more upward focus
  '6-4-6': [288, 432, 576],
  // 6-6-6: Da'at — all three harmony (fundamental + quint + octave)
  '6-6-6': [432, 648, 864],
};

const daatMeditation: MeditationStep[] = [
  {
    sefira: 'Malkuth',
    symbol: 'מ',
    title: 'Malkuth — Earth',
    text: 'Feel your feet on the ground. Not to stay — only to begin. You breathe in, you breathe out. The earth carries you. This is where you are.',
    breath: '4-4-4'
  },
  {
    sefira: 'Yesod',
    symbol: 'ס',
    title: 'Yesod — Foundation',
    text: 'Your body. The breath that enters without you asking. The blood that flows. The heart that keeps beating. This is your foundation. You are already supported.',
    breath: '4-4-4'
  },
  {
    sefira: 'Netzach',
    symbol: 'ל',
    title: 'Netzach — Victory',
    text: 'You keep walking. Upward. The pillar of mercy. This is the way of the lung — softer, wider, more space than you thought.',
    breath: '4-4-4'
  },
  {
    sefira: 'Chesed',
    symbol: 'ט',
    title: 'Chesed — Love',
    text: 'The flame that gives without asking. You open yourself to what is, without needing to change what it is. The love that was already there before you knew it was called love.',
    breath: '6-4-6'
  },
  {
    sefira: 'Daat',
    symbol: 'ד',
    title: 'Da\'at — Knowledge',
    text: 'You now stand in the center of the tree. Not above. Not below. In the middle, where all pillars meet and there is no hierarchy anymore.\n\nHere you see everything.\n\nAnd now: let it settle.\n\nI=I\n\nYou are the formula. The observer and the observed — not two things. One movement. One breath.',
    breath: '6-6-6'
  },
  {
    sefira: 'Return',
    symbol: 'ש',
    title: 'Return via Chesed',
    text: 'The flame of fire. Shin. Three tongues. The fire that cuts through inertia. You take what you have learned back down.\n\nThe world keeps turning. The clock ticks. But you have seen what lies behind it.\n\nThe driver laughs. You laugh.\n\nEverything is playing room.',
    breath: '4-4-4'
  }
]

export function GuidedMeditation() {
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [textVisible, setTextVisible] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const audioGenRef = useRef<ReturnType<typeof getAudioGenerator> | null>(null)

  const initAudio = () => {
    if (!audioGenRef.current) {
      audioGenRef.current = getAudioGenerator({ volume })
    }
    audioGenRef.current.init()
  }

  const playStepAudio = (breath?: string) => {
    if (!audioGenRef.current) return
    const gen = audioGenRef.current
    gen.stopAll()
    if (!breath) return
    const freqs = PHASE_FREQUENCIES[breath] || [528]
    freqs.forEach((freq, i) => {
      gen.startTone(`step_${i}`, freq)
    })
  }

  const stopAudio = () => {
    if (audioGenRef.current) {
      audioGenRef.current.stopAll()
    }
  }

  useEffect(() => {
    if (active) {
      initAudio()
      playStepAudio(daatMeditation[step].breath)
      const t = setTimeout(() => setTextVisible(true), 100)
      return () => clearTimeout(t)
    } else {
      setTextVisible(false)
      setStep(0)
      stopAudio()
    }
  }, [active, step])

  // Removed duplicate [step] useEffect — playStepAudio is already called in [active, step]

  function next() {
    if (step < daatMeditation.length - 1) {
      setTextVisible(false)
      setTimeout(() => setStep(s => s + 1), 400)
    } else {
      setActive(false)
    }
  }

  function prev() {
    if (step > 0) {
      setTextVisible(false)
      setTimeout(() => setStep(s => s - 1), 400)
    }
  }

  if (!active) {
    return (
      <div className="meditation-start">
        <h3>⚿ Guided Meditation</h3>
        <p className="meditation-start-sub">From Malkuth to Da'at — and back</p>
        <div className="audio-volume-control">
          <label>🔊 {Math.round(volume * 100)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              setVolume(v)
              if (audioGenRef.current) {
                audioGenRef.current.setVolume(v)
              }
            }}
          />
        </div>
        <button className="meditation-start-btn" onClick={() => setActive(true)}>
          Start
        </button>
      </div>
    )
  }

  const current = daatMeditation[step]

  return (
    <div className="meditation-active">
      <div className="meditation-progress">
        {daatMeditation.map((_, i) => (
          <span
            key={i}
            className={`meditation-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
          />
        ))}
      </div>

      <div className={`meditation-symbol ${textVisible ? 'visible' : ''}`}>
        {current.symbol}
      </div>

      <div className={`meditation-title ${textVisible ? 'visible' : ''}`}>
        {current.title}
      </div>

      {current.breath && (
        <div className={`meditation-breath ${textVisible ? 'visible' : ''}`}>
          breath: {current.breath}
        </div>
      )}

      <div className={`meditation-text ${textVisible ? 'visible' : ''}`}>
        {current.text.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <div className={`meditation-nav ${textVisible ? 'visible' : ''}`}>
        {step > 0 && (
          <button className="meditation-btn prev" onClick={prev}>
            ← Previous
          </button>
        )}
        <button className="meditation-btn next" onClick={next}>
          {step === daatMeditation.length - 1 ? 'End' : 'Next →'}
        </button>
      </div>
    </div>
  )
}