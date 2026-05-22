import { useState, useEffect } from 'react'
import hebrewLetters from './data/hebrew_letters.json'
import { TreeOfLife } from './components/TreeOfLife'
import './App.css'

interface Letter {
  id: number
  letter: string
  symbol: string
  gematria: number
  meaning: string
  meditation?: string
}

function App() {
  const [selected, setSelected] = useState<Letter | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Load notes on mount
  useEffect(() => {
    fetch('http://localhost:3001/notes')
      .then(r => r.json())
      .then(data => setNotes(data))
      .catch(() => {})
  }, [])

  function saveNote(letter: string, content: string) {
    setIsSaving(true)
    fetch(`http://localhost:3001/notes/${letter}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
      .then(() => {
        setNotes(prev => ({ ...prev, [letter]: content }))
        setIsSaving(false)
      })
      .catch(() => setIsSaving(false))
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="title">⚿ Crystal</h1>
        <p className="subtitle">22 Hebreeuwse Tekens</p>
        <ul className="letter-list">
          {hebrewLetters.map((l: Letter) => (
            <li
              key={l.id}
              className={`letter-item ${l.meditation ? 'has-meditation' : ''} ${selected?.id === l.id ? 'active' : ''}`}
              onClick={() => setSelected(l)}
            >
              <span className="letter-symbol">{l.symbol}</span>
              <span className="letter-name">{l.letter}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="detail">
        {selected ? (
          <div className="detail-inner">
            <div className="detail-symbol">{selected.symbol}</div>
            <h2 className="detail-name">{selected.letter}</h2>
            <div className="detail-gematria">
              <span className="detail-label">Gematria</span>
              <span className="detail-value">{selected.gematria}</span>
            </div>
            <p className="detail-meaning">{selected.meaning}</p>
            {selected.meditation && (
              <div className="detail-meditation">
                <h3>Meditatie</h3>
                <p>{selected.meditation}</p>
              </div>
            )}
            <div className="detail-notes">
              <h3>Notities</h3>
              <textarea
                key={selected.letter}
                placeholder="Schrijf je notities hier..."
                defaultValue={notes[selected.letter] || ''}
                onBlur={(e) => saveNote(selected.letter, e.target.value)}
              />
              {isSaving && <span className="notes-saving">Opslaan...</span>}
            </div>
            <TreeOfLife
              letters={hebrewLetters}
              selectedLetter={selected.letter}
              onPathClick={(letter) => {
                const found = hebrewLetters.find((l: Letter) => l.letter === letter)
                if (found) setSelected(found)
              }}
            />
          </div>
        ) : (
          <div className="detail-empty">
            <p>Selecteer een teken om de betekenis te zien</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App