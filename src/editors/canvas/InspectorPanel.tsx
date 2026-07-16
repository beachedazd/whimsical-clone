import { useRef } from 'react'
import type { Shape } from '../../lib/types'
import './panels.css'

interface InspectorPanelProps {
  shape: Shape | null
  onChange: (patch: Partial<Shape>) => void
}

const FILL_COLORS = [
  { color: '#fff', label: 'White' },
  { color: 'var(--bg-input)', label: 'Light' },
  { color: 'var(--ink)', label: 'Dark' },
  { color: 'var(--teal-soft)', label: 'Teal' },
]

export default function InspectorPanel({
  shape,
  onChange,
}: InspectorPanelProps) {
  const wInputRef = useRef<HTMLInputElement>(null)
  const hInputRef = useRef<HTMLInputElement>(null)

  const handleWidthChange = () => {
    if (wInputRef.current) {
      const value = parseInt(wInputRef.current.value, 10)
      if (!isNaN(value) && value >= 20) {
        onChange({ w: value })
      }
    }
  }

  const handleHeightChange = () => {
    if (hInputRef.current) {
      const value = parseInt(hInputRef.current.value, 10)
      if (!isNaN(value) && value >= 20) {
        onChange({ h: value })
      }
    }
  }

  const handleColorClick = (color: string) => {
    onChange({ color })
  }

  if (!shape) {
    return (
      <div className="inspector-panel">
        <div className="inspector-panel__empty">Select an element</div>
      </div>
    )
  }

  return (
    <div className="inspector-panel">
      <div className="inspector-panel__section-label">Frame</div>

      <div className="inspector-panel__row">
        <span className="inspector-panel__row-label">W</span>
        <input
          ref={wInputRef}
          type="number"
          className="inspector-panel__input"
          value={shape.w}
          onChange={handleWidthChange}
          onBlur={handleWidthChange}
          min={20}
        />
      </div>

      <div className="inspector-panel__row">
        <span className="inspector-panel__row-label">H</span>
        <input
          ref={hInputRef}
          type="number"
          className="inspector-panel__input"
          value={shape.h}
          onChange={handleHeightChange}
          onBlur={handleHeightChange}
          min={20}
        />
      </div>

      <div className="inspector-panel__section-label">Fill</div>

      <div className="inspector-panel__swatches">
        {FILL_COLORS.map(({ color, label }) => (
          <button
            key={label}
            className={`inspector-panel__swatch ${
              shape.color === color ? 'inspector-panel__swatch--active' : ''
            }`}
            style={{
              backgroundColor: color,
              borderColor: color === '#fff' ? 'var(--violet)' : 'transparent',
            }}
            onClick={() => handleColorClick(color)}
            type="button"
            aria-label={`Fill ${label}`}
          />
        ))}
      </div>

      <div className="inspector-panel__section-label">Stroke</div>

      <div className="inspector-panel__row">
        <span className="inspector-panel__row-label">Weight</span>
        <span style={{ fontWeight: 600 }}>2px</span>
      </div>
    </div>
  )
}
