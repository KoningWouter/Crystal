import { sefirot, paths } from '../data/treeOfLife'
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
  const selectedPath = selectedLetter
    ? paths.find(p => p.letter === selectedLetter)
    : null

  const getLetterSymbol = (letterName: string) =>
    letters.find(l => l.letter === letterName)?.symbol

  return (
    <div className="tree-of-life">
      <div className="tree-header">
        <h3>Tree of Life</h3>
        <p>Paths of the 22 Signs</p>
      </div>
      <svg viewBox="0 0 100 100" className="tree-svg">
        {paths.map((path) => {
          const from = sefirot.find(s => s.id === path.from)!
          const to = sefirot.find(s => s.id === path.to)!
          const isSelected = selectedPath?.letter === path.letter
          return (
            <g
              key={`${path.from}-${path.to}`}
              className="tree-path-clickable"
              onClick={() => onPathClick?.(path.letter)}
            >
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={`tree-path ${isSelected ? 'lit' : ''}`}
              />
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 1.5}
                className={`tree-path-label ${isSelected ? 'lit' : ''}`}
              >
                {getLetterSymbol(path.letter)}
              </text>
            </g>
          )
        })}
        {sefirot.map((sefira) => (
          <g
            key={sefira.id}
            className={`tree-sefira ${selectedPath && (sefira.id === selectedPath.from || sefira.id === selectedPath.to) ? 'highlighted' : ''}`}
          >
            <circle cx={sefira.x} cy={sefira.y} r="2.5" />
          </g>
        ))}
      </svg>
      <div className="tree-legend">
        <span className="legend-lit">✦ selected path</span>
        <span className="legend-path">— path</span>
      </div>
    </div>
  )
}
