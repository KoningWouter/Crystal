import { useState, useRef } from 'react'
import './CombinationMeditation.css'
import { getAudioGenerator } from '../utils/AudioGenerator'

interface MeditationStep {
  sefira: string
  title: string
  text: string
  breath: string
}

const COMBO_FREQUENCIES: Record<string, number[]> = {
  // 432 Hz Lydian systeem: C(1) D(10/9) E(5/4) F#(45/32) G(3/2) A(5/3) B(15/8)
  '4-4-4': [324, 432, 648],    // E4=324, A4=432, D5=648 (aards, stabiel)
  '4-6-4': [270, 360, 540],   // C#4=270, F#4=360, C5=540 (scherp, focus)
  '5-5-5': [360, 480, 720],   // F#4=360, B4=480, F5=720 (opwaarts, transform)
  '6-6-6': [432, 648, 864],   // A4=432, D5=648, A5=864 — Da'at akkoord (volheid)
};

const steps: MeditationStep[] = [
  {
    sefira: '1',
    title: 'De Letters Apart',
    text: 'Neem ieder teken apart. Wat is de vorm? De klank? Het gewicht? Zie ze niet als symbolen — zie ze als personen. Elk met eigen karakter.',
    breath: '4-4-4',
  },
  {
    sefira: '2',
    title: 'De Combinatie Als Geheel',
    text: 'Wat gebeurt er als ze samenkomen? Welk beeld ontstaat? Is er harmonie of spanning? De letters zijn nu in gesprek — luister.',
    breath: '4-6-4',
  },
  {
    sefira: '3',
    title: 'Het Getal en de Boom',
    text: 'Het getal is de brug. Welke sephira hoort hierbij? Welke positie op de boom? Laat het getal een vorm krijgen — een plek in de structuur.',
    breath: '5-5-5',
  },
  {
    sefira: '4',
    title: 'Stil Worden',
    text: 'Na het denken: stilte. Houd de combinatie vast zonder te analyseren. Laat het bezinken. Er is niets meer te doen.',
    breath: '6-6-6',
  },
]

export function CombinationMeditation() {
  const [currentStep, setCurrentStep] = useState(-1)
  const [inputLetters, setInputLetters] = useState('')
  const [volume, setVolume] = useState(0.3)
  const audioGenRef = useRef<ReturnType<typeof getAudioGenerator> | null>(null)

  const initAudio = () => {
    if (!audioGenRef.current) {
      audioGenRef.current = getAudioGenerator({ volume })
    }
    audioGenRef.current.init()
  }

  const playStepAudio = (breath: string) => {
    if (!audioGenRef.current) return
    const gen = audioGenRef.current
    gen.stopAll()
    const freqs = COMBO_FREQUENCIES[breath] || [528]
    freqs.forEach((freq, i) => {
      gen.startTone(`combo_${i}`, freq)
    })
  }

  const stopAudio = () => {
    if (audioGenRef.current) {
      audioGenRef.current.stopAll()
    }
  }

  function start() {
    initAudio()
    setCurrentStep(0)
    playStepAudio(steps[0].breath)
  }

  function next() {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      playStepAudio(steps[nextStep].breath)
    } else {
      stopAudio()
      setCurrentStep(-1)
      setInputLetters('')
    }
  }

  function prev() {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      playStepAudio(steps[prevStep].breath)
    }
  }

  function handleReset() {
    stopAudio()
    setCurrentStep(-1)
  }

  if (currentStep === -1) {
    return (
      <div className="combo-meditation" style={{ textAlign: 'left' }}>
        <div className="combo-meditation-start">
          <h3>Meditation on Combination</h3>
          <p className="combo-meditation-desc">
            Four steps: letters apart, combination as a whole, the number and the tree, becoming still.
          </p>
          
          <div className="combo-meditation-input-wrap">
            <p className="combo-meditation-input-label">
              Type the letters you want to explore
            </p>
            <input
              type="text"
              className="combo-meditation-input"
              value={inputLetters}
              onChange={(e) => setInputLetters(e.target.value)}
              placeholder="דעת..."
              dir="rtl"
            />
          </div>

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

          <button
            className="combo-meditation-start-btn"
            onClick={start}
            disabled={!inputLetters.trim()}
          >
            Begin de meditatie
          </button>
        </div>
      </div>
    )
  }

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1

  return (
    <div className="combo-meditation" style={{ textAlign: 'left' }}>
      <div className="combo-meditation-header">
        <button
          className="combo-meditation-reset"
          onClick={handleReset}
        >
          ← Back
        </button>
        <span className="combo-meditation-progress">
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      <div className="combo-meditation-letters">
        {inputLetters}
      </div>

      <div className="combo-meditation-step">
        <span className="combo-meditation-step-title">{step.title}</span>
        <p className="combo-meditation-step-text">{step.text}</p>
        <div className="combo-meditation-breath">
          <span className="combo-meditation-breath-label">Breath</span>
          <span className="combo-meditation-breath-value">{step.breath}</span>
        </div>
      </div>

      <div className="combo-meditation-nav">
        <button
          className="combo-meditation-prev"
          onClick={prev}
          disabled={currentStep === 0}
        >
          Previous
        </button>
        <button
          className="combo-meditation-next"
          onClick={next}
        >
          {isLast ? 'Done' : 'Next →'}
        </button>
      </div>

      <div className="combo-meditation-dots">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`combo-meditation-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}