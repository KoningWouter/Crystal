import { useState, useRef, useEffect } from 'react'
import './CombinationMeditation.css'
import { getAudioGenerator } from '../utils/AudioGenerator'
import hebrewLetters from '../data/hebrew_letters.json'

interface Letter {
  id: number
  letter: string
  symbol: string
  gematria: number
  meaning: string
  meditation?: string
}

// Map Hebrew letter symbols to gematria values
const LETTER_GEMATRIA: Record<string, number> = {}
for (const l of hebrewLetters as Letter[]) {
  LETTER_GEMATRIA[l.symbol] = l.gematria
  LETTER_GEMATRIA[l.letter] = l.gematria
}

// Final forms (Sofiot) — not in hebrew_letters.json
LETTER_GEMATRIA['ך'] = 20   // Kaph Sofit
LETTER_GEMATRIA['ם'] = 40   // Mem Sofit
LETTER_GEMATRIA['ן'] = 50   // Nun Sofit
LETTER_GEMATRIA['ף'] = 80   // Pe Sofit
LETTER_GEMATRIA['ץ'] = 90   // Tsade Sofit

export function CombinationMeditation() {
  const [input, setInput] = useState('')
  const [volume, setVolume] = useState(0.3)
  const [isPlaying, setIsPlaying] = useState(false)
  const [totalGematria, setTotalGematria] = useState(0)
  const audioGenRef = useRef<ReturnType<typeof getAudioGenerator> | null>(null)

  const initAudio = () => {
    if (!audioGenRef.current) {
      audioGenRef.current = getAudioGenerator({ volume })
    }
    audioGenRef.current.init()
  }

  // Parse letters and calculate total gematria
  useEffect(() => {
    const chars = [...input]
    let total = 0
    for (const char of chars) {
      if (char.trim() === '') continue
      const g = LETTER_GEMATRIA[char]
      if (g !== undefined) {
        total += g
      }
    }
    setTotalGematria(total)
  }, [input])

  const play = () => {
    initAudio()
    const gen = audioGenRef.current!
    gen.stopAll()

    const chars = [...input].filter(c => c.trim() !== '')
    const gemValues: number[] = []

    for (const char of chars) {
      if (char.length !== 1) continue
      const g = LETTER_GEMATRIA[char]
      if (g !== undefined) {
        gemValues.push(g)
      }
    }

    if (gemValues.length === 0) return

    // Play all letters as one chord
    gemValues.forEach((g, i) => {
      const freq = gen.getFrequency(g)
      gen.startTone(`combo_${i}`, freq)
    })

    setIsPlaying(true)
  }

  const stop = () => {
    if (audioGenRef.current) {
      audioGenRef.current.stopAll()
    }
    setIsPlaying(false)
  }

  const toggle = () => {
    if (isPlaying) {
      stop()
    } else {
      play()
    }
  }

  return (
    <div className="combo-meditation" style={{ textAlign: 'left' }}>
      <h3>Combination</h3>

      <div className="combo-input-wrap">
        <input
          type="text"
          className="combo-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type letters..."
          dir="rtl"
        />
        {totalGematria > 0 && (
          <div className="combo-gematria">
            <span className="combo-gematria-label">Total</span>
            <span className="combo-gematria-value">{totalGematria}</span>
          </div>
        )}
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
        className={`combo-btn ${isPlaying ? 'stop' : 'play'}`}
        onClick={toggle}
        disabled={totalGematria === 0}
      >
        {isPlaying ? '⏹ Stop' : '▶ Play'}
      </button>
    </div>
  )
}