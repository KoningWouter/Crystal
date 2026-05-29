import { useState, useEffect } from 'react'
import hebrewLetters from './data/hebrew_letters.json'
import { TreeOfLife } from './components/TreeOfLife'
import { GuidedMeditation } from './components/GuidedMeditation'
import { GematriaCalculator } from './components/GematriaCalculator'
import { CombinationMeditation } from './components/CombinationMeditation'
import { SoundBath } from './components/SoundBath'
import { EntryPoint } from './components/EntryPoint'
import { DaatView } from './components/DaatView'
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
  const [showMeditation, setShowMeditation] = useState(false)
  const [showGematria, setShowGematria] = useState(false)
  const [showComboMeditation, setShowComboMeditation] = useState(false)
  const [showSoundBath, setShowSoundBath] = useState(false)
  const [showEntry, setShowEntry] = useState(false)
  const [showDaat, setShowDaat] = useState(false)
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

  function handleSelectLetter(l: Letter) {
    setShowMeditation(false)
    setShowGematria(false)
    setShowComboMeditation(false)
    setShowSoundBath(false)
    setShowEntry(false)
    setShowDaat(false)
    setSelected(l)
  }

  function handleShowMeditation() {
    setSelected(null)
    setShowGematria(false)
    setShowComboMeditation(false)
    setShowSoundBath(false)
    setShowEntry(false)
    setShowDaat(false)
    setShowMeditation(true)
  }

  function handleShowGematria() {
    setSelected(null)
    setShowMeditation(false)
    setShowComboMeditation(false)
    setShowSoundBath(false)
    setShowEntry(false)
    setShowDaat(false)
    setShowGematria(true)
  }

  function handleShowComboMeditation() {
    setSelected(null)
    setShowMeditation(false)
    setShowGematria(false)
    setShowSoundBath(false)
    setShowEntry(false)
    setShowDaat(false)
    setShowComboMeditation(true)
  }

  function handleShowSoundBath() {
    setSelected(null)
    setShowMeditation(false)
    setShowGematria(false)
    setShowComboMeditation(false)
    setShowEntry(false)
    setShowDaat(false)
    setShowSoundBath(true)
  }

  function handleShowEntry() {
    setSelected(null)
    setShowMeditation(false)
    setShowGematria(false)
    setShowComboMeditation(false)
    setShowSoundBath(false)
    setShowDaat(false)
    setShowEntry(true)
  }

  function handleShowDaat() {
    setSelected(null)
    setShowMeditation(false)
    setShowGematria(false)
    setShowComboMeditation(false)
    setShowSoundBath(false)
    setShowEntry(false)
    setShowDaat(true)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="title">⚿ Crystal</h1>
        <p className="subtitle">22 Hebrew Signs</p>
        <ul className="letter-list">
          <li
            className={`meditation-link ${showMeditation ? 'active' : ''}`}
            onClick={handleShowMeditation}
          >
            <span className="meditation-icon">☽</span>
            <span className="meditation-name">Guided Meditation</span>
          </li>
          <li
            className={`gematria-link ${showGematria ? 'active' : ''}`}
            onClick={handleShowGematria}
          >
            <span className="gematria-icon">ג</span>
            <span className="gematria-name">Gematria</span>
          </li>
          <li
            className={`combo-link ${showComboMeditation ? 'active' : ''}`}
            onClick={handleShowComboMeditation}
          >
            <span className="combo-icon">◈</span>
            <span className="combo-name">Combination Meditation</span>
          </li>
          <li
            className={`entry-link ${showEntry ? 'active' : ''}`}
            onClick={handleShowEntry}
          >
            <span className="entry-icon">⌂</span>
            <span className="entry-name">Enter</span>
          </li>
          <li
            className={`soundbath-link ${showSoundBath ? 'active' : ''}`}
            onClick={handleShowSoundBath}
          >
            <span className="soundbath-icon">♫</span>
            <span className="soundbath-name">Sound Sheet</span>
          </li>
          {hebrewLetters.map((l: Letter) => (
            <li
              key={l.id}
              className={`letter-item ${l.meditation ? 'has-meditation' : ''} ${selected?.id === l.id ? 'active' : ''}`}
              onClick={() => handleSelectLetter(l)}
            >
              <span className="letter-symbol">{l.symbol}</span>
              <span className="letter-name">{l.letter}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="detail">
        {showGematria ? (
          <div className="detail-inner">
            <GematriaCalculator />
          </div>
        ) : showComboMeditation ? (
          <div className="detail-inner">
            <CombinationMeditation />
          </div>
        ) : showMeditation ? (
          <div className="detail-inner">
            <GuidedMeditation />
          </div>
        ) : showSoundBath ? (
          <div className="detail-inner">
            <SoundBath />
          </div>
        ) : showDaat ? (
          <div className="detail-inner">
            <DaatView />
          </div>
        ) : showEntry ? (
          <div className="detail-inner">
            <EntryPoint
              letters={hebrewLetters}
              onSelectLetter={handleSelectLetter}
              onDaatView={handleShowDaat}
            />
          </div>
        ) : selected ? (
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
                <h3>Meditation</h3>
                <p>{selected.meditation}</p>
              </div>
            )}
            <div className="detail-notes">
              <h3>Notes</h3>
              <textarea
                key={selected.letter}
                placeholder="Write your notes here..."
                defaultValue={notes[selected.letter] || ''}
                onBlur={(e) => saveNote(selected.letter, e.target.value)}
              />
              {isSaving && <span className="notes-saving">Saving...</span>}
            </div>
            <TreeOfLife
              letters={hebrewLetters}
              selectedLetter={selected.letter}
              onPathClick={(letter) => {
                const found = hebrewLetters.find((l: Letter) => l.letter === letter || l.symbol === letter)
                if (found) handleSelectLetter(found)
              }}
            />
          </div>
        ) : (
          <div className="detail-empty">
            <p>Select a sign to see its meaning</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App