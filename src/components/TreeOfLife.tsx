import { sefirot, paths } from '../data/treeOfLife'
import { useState } from 'react'
import './TreeOfLife.css'

interface Letter {
  id: number
  letter: string
  symbol: string
  gematria: number
  meaning: string
  meditation?: string
}

interface TreeOfLifeProps {
  letters: Letter[]
  selectedLetter: string | null
  onPathClick?: (letter: string) => void
}

export function TreeOfLife({ letters, selectedLetter, onPathClick }: TreeOfLifeProps) {
  const [hoveredSefira, setHoveredSefira] = useState<string | null>(null)
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)

  // Helper to get English name for a Hebrew symbol
  const getLetterName = (symbol: string): string | null => {
    const found = letters.find(l => l.symbol === symbol)
    return found ? found.letter : null
  }

  // Helper to match letter by Hebrew symbol or English name
  const matchesLetter = (pathLetter: string, selected: string): boolean => {
    if (pathLetter === selected) return true
    const found = letters.find(l => l.symbol === pathLetter)
    return found ? found.letter === selected : false
  }

  // Get highlighted sefira IDs for selected letter
  const highlightedSefiraIds = selectedLetter
    ? paths
        .filter(p => matchesLetter(p.letter, selectedLetter))
        .flatMap(p => [p.from, p.to])
    : []

  return (
    <div className="tree-of-life">
      <div className="tree-header">
        <h3>Tree of Life</h3>
        <p>Paths of the 22 Characters</p>
      </div>
      <svg viewBox="0 0 100 150" className="tree-svg">
        {/* Render all path lines only */}
        {paths.map((path) => {
          const from = sefirot.find(s => s.id === path.from)
          const to = sefirot.find(s => s.id === path.to)
          if (!from || !to) return null

          const isSelected = selectedLetter ? matchesLetter(path.letter, selectedLetter) : false
          const pathKey = `${path.from}-${path.to}`

          return (
            <g
              key={pathKey}
              className="tree-path-clickable"
              onMouseEnter={() => setHoveredPath(pathKey)}
              onMouseLeave={() => setHoveredPath(null)}
              onClick={() => onPathClick ? onPathClick(path.letter) : undefined}
            >
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={`tree-path ${isSelected ? 'lit' : ''}`}
              />
            </g>
          )
        })}

        {/* Render all path labels on top (separate layer) */}
        {paths.map((path) => {
          const from = sefirot.find(s => s.id === path.from)
          const to = sefirot.find(s => s.id === path.to)
          if (!from || !to) return null

          const isSelected = selectedLetter ? matchesLetter(path.letter, selectedLetter) : false
          const hasLetter = path.letter !== ''
          const pathKey = `${path.from}-${path.to}`
          const isHovered = hoveredPath === pathKey
          const letterName = hasLetter ? getLetterName(path.letter) : null

          return hasLetter ? (
            <g key={`label-${pathKey}`}>
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 0.8}
                dy="0"
                className={`tree-path-label ${isSelected ? 'lit' : ''}`}
                dominantBaseline="central"
                textAnchor="middle"
              >
                {path.letter}
              </text>
              {isHovered && letterName ? (
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 + 2.5}
                  className="tree-path-hover-name"
                  dominantBaseline="central"
                  textAnchor="middle"
                >
                  {letterName}
                </text>
              ) : null}
            </g>
          ) : null
        })}
        
        {/* Render sefirot on top */}
        {sefirot.map((sefira) => {
          const isHighlighted = highlightedSefiraIds.includes(sefira.id)
          const isHovered = hoveredSefira === sefira.id
          const isDaat = sefira.id === 'da_at'
          return (
            <g
              key={sefira.id}
              className={`tree-sefira ${isHighlighted ? 'highlighted' : ''} ${isHovered ? 'hovered' : ''} ${isDaat ? 'da-at' : ''}`}
              onMouseEnter={() => setHoveredSefira(sefira.id)}
              onMouseLeave={() => setHoveredSefira(null)}
            >
              <circle 
                cx={sefira.x} 
                cy={sefira.y} 
                r={isHovered ? 4 : (isDaat ? 3 : 2.5)} 
                className={isDaat ? 'da-at-circle' : ''}
              />
              {isHovered ? (
                <text
                  x={sefira.x}
                  y={sefira.y - 6}
                  className="tree-sefira-name"
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  {sefira.name}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
      <div className="tree-legend">
        <span className="legend-lit">✦ selected path</span>
        <span className="legend-path">— path</span>
        <span className="legend-da-at">◦ Da'at</span>
      </div>
    </div>
  )
}