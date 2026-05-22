import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, 'notes.json')

const app = express()
app.use(cors())
app.use(express.json())

// Load notes from file
function loadNotes() {
  if (!existsSync(DATA_FILE)) return {}
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

// Save notes to file
function saveNotes(notes) {
  writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2))
}

// GET all notes
app.get('/notes', (req, res) => {
  const notes = loadNotes()
  res.json(notes)
})

// PUT update notes for a specific letter
app.put('/notes/:letter', (req, res) => {
  const { letter } = req.params
  const { content } = req.body
  const notes = loadNotes()
  notes[letter] = content
  saveNotes(notes)
  res.json({ success: true, letter, content })
})

// DELETE a note for a specific letter
app.delete('/notes/:letter', (req, res) => {
  const { letter } = req.params
  const notes = loadNotes()
  delete notes[letter]
  saveNotes(notes)
  res.json({ success: true, letter })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Notes server running on http://localhost:${PORT}`)
})