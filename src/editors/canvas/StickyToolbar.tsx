import { STICKY_COLORS } from '../../lib/types'
import './panels.css'

interface StickyToolbarProps {
  activeColor: string
  onPick: (color: string) => void
  canVote: boolean
  onVote: () => void
}

const ROTATIONS = [-3, 2, -2, 3]

export default function StickyToolbar({
  activeColor,
  onPick,
  canVote,
  onVote,
}: StickyToolbarProps) {
  return (
    <div className="sticky-toolbar">
      {STICKY_COLORS.map((color, index) => (
        <button
          key={color}
          className={`sticky-toolbar__color ${
            activeColor === color ? 'sticky-toolbar__color--active' : ''
          }`}
          style={{
            backgroundColor: color,
            transform: `rotate(${ROTATIONS[index]}deg)`,
          }}
          onClick={() => onPick(color)}
          type="button"
          aria-label={`Pick color ${color}`}
        />
      ))}

      <div className="sticky-toolbar__divider" />

      <button
        className="sticky-toolbar__vote-btn"
        onClick={onVote}
        disabled={!canVote}
        type="button"
      >
        Vote
      </button>
    </div>
  )
}
