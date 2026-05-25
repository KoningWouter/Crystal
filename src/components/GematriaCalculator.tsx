import { useState, useEffect, useRef } from 'react'
import './GematriaCalculator.css'
import { getAudioGenerator } from '../utils/AudioGenerator'

// Standard Hebrew gematria values
const gematriaValues: Record<string, number> = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10,
  כ: 20, ל: 30, מ: 40, נ: 50, ס: 60, ע: 70, פ: 80, צ: 90,
  ק: 100, ר: 200, ש: 300, ת: 400,
  // Finals
  ך: 20, ם: 40, ן: 50, ף: 80, ץ: 90,
  // Common combinations
  'שם': 345, // Shem
  'אהיה': 21, // Ehyeh
  'יהוה': 26, // YHWH
  'חכמה': 73, // Chokhmah
  'בינה': 67, // Binah
  'דעת': 474, // Daat
}

function calculateGematria(text: string): number {
  if (gematriaValues[text] !== undefined) {
    return gematriaValues[text]
  }
  let total = 0
  for (const char of text) {
    if (gematriaValues[char] !== undefined) {
      total += gematriaValues[char]
    }
  }
  return total
}

function getCombinationsForSum(target: number, letters: string[]): string[] {
  const results: string[] = []
  const singleLetters = letters.filter(k => k.length === 1)

  const tryCombo = (combo: string) => {
    if (calculateGematria(combo) === target) results.push(combo)
  }

  // 2-letter
  for (let i = 0; i < singleLetters.length; i++) {
    for (let j = 0; j < singleLetters.length; j++) {
      tryCombo(singleLetters[i] + singleLetters[j])
    }
  }
  // 3-letter
  for (let i = 0; i < singleLetters.length; i++) {
    for (let j = 0; j < singleLetters.length; j++) {
      for (let k = 0; k < singleLetters.length; k++) {
        tryCombo(singleLetters[i] + singleLetters[j] + singleLetters[k])
      }
    }
  }
  // 4-letter
  for (let i = 0; i < singleLetters.length; i++) {
    for (let j = 0; j < singleLetters.length; j++) {
      for (let k = 0; k < singleLetters.length; k++) {
        for (let l = 0; l < singleLetters.length; l++) {
          tryCombo(singleLetters[i] + singleLetters[j] + singleLetters[k] + singleLetters[l])
        }
      }
    }
  }

  return results
}

export function GematriaCalculator() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [searchTarget, setSearchTarget] = useState('')
  const [showCombos, setShowCombos] = useState(false)
  const [combos, setCombos] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const audioGenRef = useRef<ReturnType<typeof getAudioGenerator> | null>(null)

  const initAudio = () => {
    if (!audioGenRef.current) {
      audioGenRef.current = getAudioGenerator({ volume })
    }
    audioGenRef.current.init()
  }

  const playLetterTones = (letters: string) => {
    initAudio()
    const gen = audioGenRef.current
    if (!gen) return
    gen.stopAll()

    // Verzamel alle frequenties van alle letters
    const freqs: { gematria: number; freq: number }[] = []
    letters.split('').forEach((char: string) => {
      const value = gematriaValues[char]
      if (value) {
        freqs.push({ gematria: value, freq: gen.gematriaToFrequency(value) })
      }
    })

    if (freqs.length === 0) return

    // Speel alle letters samen als akkoord
    gen.stopAll()
    freqs.forEach(({ freq }, i) => {
      gen.playToneAt(`letter_${i}`, freq, 3)
    })
  }

  useEffect(() => {
    if (input.trim()) {
      setResult(calculateGematria(input))
    } else {
      setResult(null)
    }
  }, [input])

  function handleSearch() {
    const target = parseInt(searchTarget)
    if (isNaN(target) || target < 1) return
    setIsSearching(true)
    setShowCombos(true)
    setTimeout(() => {
      const letters = Object.keys(gematriaValues).filter(k => k.length === 1)
      const found = getCombinationsForSum(target, letters)
      setCombos(found)
      setIsSearching(false)
    }, 50)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="gematria">
      <div className="gematria-header">
        <h3>גמטריה</h3>
        <p className="gematria-sub">Type Hebrew letters</p>
      </div>

      <div className="gematria-input-wrap">
        <input
          type="text"
          className="gematria-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => {
            if (e.currentTarget.value.length > 0) {
              playLetterTones(e.currentTarget.value)
            }
          }}
          placeholder="אבג..."
          dir="rtl"
        />
        <button
          className="gematria-play-btn"
          onClick={() => input.trim() && playLetterTones(input)}
          disabled={!input.trim()}
          title="Play frequency"
        >
          🔊
        </button>
        {result !== null && input.trim() !== '' && (
          <div className="gematria-result">
            <span className="gematria-value">{result}</span>
            {result === 666 && <span className="gematria-666">⚠ 666</span>}
            {result === 26 && <span className="gematria-special">יהוה</span>}
            {result === 474 && <span className="gematria-special">דעת</span>}
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
            if (audioGenRef.current) audioGenRef.current.setVolume(v)
          }}
        />
      </div>

      <div className="gematria-known">
        <p className="gematria-known-title">Known values</p>
        <div className="gematria-known-list">
          {[
            { word: 'יהוה', val: 26 },
            { word: 'דעת', val: 474 },
            { word: 'חכמה', val: 73 },
            { word: 'שם', val: 345 },
          ].map(({ word, val }) => (
            <button key={word} className="gematria-known-item" onClick={() => setInput(word)}>
              <span className="gematria-known-letters" dir="rtl">{word}</span>
              <span className="gematria-known-value">= {val}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="gematria-search">
        <p className="gematria-search-title">Find combinations</p>
        <div className="gematria-search-row">
          <input
            type="number"
            className="gematria-search-input"
            value={searchTarget}
            onChange={(e) => setSearchTarget(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="..."
            min="1"
          />
          <button className="gematria-search-btn" onClick={handleSearch} disabled={!searchTarget}>
            Search
          </button>
        </div>
      </div>

      {showCombos && (
        <div className="gematria-results">
          {isSearching ? (
            <p className="gematria-searching">Searching...</p>
          ) : combos.length > 0 ? (
            <>
              <p className="gematria-results-title">
                Combinations for {searchTarget} ({combos.length})
              </p>
              <div className="gematria-results-list">
                {combos.map((combo, i) => (
                  <button
                    key={i}
                    className="gematria-result-item"
                    onClick={() => {
                      setInput(combo)
                      playLetterTones(combo)
                    }}
                    dir="rtl"
                  >
                    {combo} = {calculateGematria(combo)}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="gematria-no-results">
              No 2-4 letter combinations found for {searchTarget}
            </p>
          )}
        </div>
      )}
    </div>
  )
}