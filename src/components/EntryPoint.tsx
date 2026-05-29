import { useState } from 'react'
import './EntryPoint.css'

export interface Letter {
  id: number
  letter: string
  symbol: string
  gematria: number
  meaning: string
  meditation?: string
}

export interface EntryProps {
  letters: Letter[]
  onSelectLetter: (letter: Letter) => void
  onDaatView: () => void
}

type Choice = 'A' | 'B' | 'C' | 'D' | 'E' | null

// Maps choices to letter IDs (all letters in hebrew_letters.json)
const CHOICE_LETTERS: Record<string, number[]> = {
  A: [13, 15], // Mem, Samech — rust, support
  B: [4, 22],  // Zayin, Tav — cut, complete
  C: [8, 3],   // Chet, Daleth — fence, door
  E: [10, 1],  // Yod, Aleph — hand, breath
}

const CHOICES = [
  {
    id: 'A' as Choice,
    emoji: '🌊',
    title: 'Give Rest',
    desc: 'My head is too loud, I want silence',
  },
  {
    id: 'B' as Choice,
    emoji: '⚔️',
    title: 'Let Go',
    desc: 'Something that is done — close it, put it down',
  },
  {
    id: 'C' as Choice,
    emoji: '🪬',
    title: 'Feel Boundaries',
    desc: 'I want to know where I end and the world begins',
  },
  {
    id: 'D' as Choice,
    emoji: '◈',
    title: 'Into the Core',
    desc: 'I=I — directly to where it belongs',
  },
  {
    id: 'E' as Choice,
    emoji: '✋',
    title: 'Start Small',
    desc: 'The very first step — something concrete',
  },
]

export function EntryPoint({ letters, onSelectLetter, onDaatView }: EntryProps) {
  const [choice, setChoice] = useState<Choice>(null)

  function handleChoice(chosen: Choice) {
    if (chosen === 'D') {
      onDaatView()
    } else {
      setChoice(chosen)
    }
  }

  function handleBack() {
    setChoice(null)
  }

  function handleLetterClick(letter: Letter) {
    onSelectLetter(letter)
  }

  if (choice === null) {
    // Phase 1: question
    return (
      <div className="entry-question">
        <h2 className="entry-title">What do you need today?</h2>
        <div className="entry-choices">
          {CHOICES.map(c => (
            <button
              key={c.id}
              className="entry-choice"
              onClick={() => handleChoice(c.id)}
            >
              <span className="entry-choice-emoji">{c.emoji}</span>
              <span className="entry-choice-text">
                <strong>{c.title}</strong>
                <small>{c.desc}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Phase 2: filtered letters
  const letterIds = CHOICE_LETTERS[choice]
  const filtered = letterIds
    ? letters.filter(l => letterIds.includes(l.id))
    : []

  return (
    <div className="entry-letters">
        <button className="entry-back" onClick={handleBack}>
          ← Back
        </button>
      <div className="entry-filtered">
        {filtered.map(l => (
          <button
            key={l.id}
            className="entry-letter-btn"
            onClick={() => handleLetterClick(l)}
          >
            <span className="entry-letter-symbol">{l.symbol}</span>
            <span className="entry-letter-name">{l.letter}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
