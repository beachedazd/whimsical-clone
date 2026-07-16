import type { ShapeKind } from '../../lib/types'
import './panels.css'

interface WireframeLibraryProps {
  onAdd: (kind: ShapeKind) => void
}

type LibraryItem = {
  label: string
  kind: ShapeKind
  icon: React.ReactNode
}

const basicItems: LibraryItem[] = [
  {
    label: 'Button',
    kind: 'wf-button',
    icon: (
      <div
        style={{
          width: 44,
          height: 16,
          background: '#2a2830',
          borderRadius: 8,
        }}
      />
    ),
  },
  {
    label: 'Input',
    kind: 'wf-input',
    icon: (
      <div
        style={{
          width: 44,
          height: 16,
          border: '1.5px solid #b6b2bd',
          borderRadius: 4,
        }}
      />
    ),
  },
  {
    label: 'Text',
    kind: 'wf-text',
    icon: (
      <div
        style={{
          width: 44,
          height: 6,
          background: '#b6b2bd',
          borderRadius: 3,
          boxShadow: '0 10px 0 #d9d6d0',
        }}
      />
    ),
  },
  {
    label: 'Image',
    kind: 'wf-image',
    icon: (
      <div
        style={{
          width: 36,
          height: 26,
          background:
            'repeating-linear-gradient(45deg, #e6e3dd, #e6e3dd 4px, #efede8 4px, #efede8 8px)',
          borderRadius: 4,
          border: '1px solid #d9d6d0',
        }}
      />
    ),
  },
  {
    label: 'Toggle',
    kind: 'wf-toggle',
    icon: (
      <div
        style={{
          width: 28,
          height: 16,
          background: 'var(--teal)',
          borderRadius: 999,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 2,
            top: 2,
            width: 12,
            height: 12,
            background: '#fff',
            borderRadius: '50%',
          }}
        />
      </div>
    ),
  },
  {
    label: 'Tabs',
    kind: 'wf-tabs',
    icon: (
      <div
        style={{
          width: 44,
          height: 18,
          border: '1.5px solid #b6b2bd',
          borderRadius: 4,
          display: 'flex',
        }}
      >
        <div
          style={{
            width: '33%',
            borderRight: '1.5px solid #b6b2bd',
          }}
        />
        <div
          style={{
            width: '33%',
            borderRight: '1.5px solid #b6b2bd',
          }}
        />
      </div>
    ),
  },
]

const mobileItems: LibraryItem[] = [
  {
    label: 'Phone',
    kind: 'wf-phone',
    icon: (
      <div
        style={{
          width: 22,
          height: 38,
          border: '1.5px solid #b6b2bd',
          borderRadius: 5,
        }}
      />
    ),
  },
]

export default function WireframeLibrary({ onAdd }: WireframeLibraryProps) {
  const handleTileClick = (kind: ShapeKind) => {
    onAdd(kind)
  }

  const renderTile = (item: LibraryItem) => (
    <button
      key={item.kind}
      className="wireframe-library__tile"
      onClick={() => handleTileClick(item.kind)}
      type="button"
      aria-label={`Add ${item.label}`}
    >
      {item.icon}
      <span className="wireframe-library__tile-label">{item.label}</span>
    </button>
  )

  return (
    <div className="wireframe-library">
      <input
        type="text"
        className="wireframe-library__search"
        placeholder="Search elements…"
        disabled
      />

      <div className="wireframe-library__section-label">Basics</div>
      <div className="wireframe-library__grid">
        {basicItems.map(renderTile)}
      </div>

      <div className="wireframe-library__section-label">Mobile</div>
      <div className="wireframe-library__grid">
        {mobileItems.map(renderTile)}
      </div>
    </div>
  )
}
