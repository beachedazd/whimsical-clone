import { memo } from 'react'
import type { Shape } from '../../lib/types'

interface ShapeViewProps {
  shape: Shape
  isSelected: boolean
  isEditing: boolean
  isConnectSource?: boolean
  onTextChange: (text: string) => void
  onTextBlur: () => void
}

const ShapeView = memo(function ShapeView({
  shape,
  isSelected,
  isEditing,
  isConnectSource,
  onTextChange,
  onTextBlur,
}: ShapeViewProps) {
  const { kind, x, y, w, h, text, color, rotation } = shape

  const getShapeElement = () => {
    const shapeProps = {
      x: 0,
      y: 0,
      width: w,
      height: h,
      fill: '#fff',
      stroke: color || 'var(--violet)',
      strokeWidth: 2,
    }

    switch (kind) {
      case 'rect':
        return <rect {...shapeProps} rx={10} ry={10} />
      case 'pill':
        return <rect {...shapeProps} rx={h / 2} ry={h / 2} />
      case 'ellipse':
        return (
          <ellipse
            cx={w / 2}
            cy={h / 2}
            rx={w / 2}
            ry={h / 2}
            fill="#fff"
            stroke={color || 'var(--violet)'}
            strokeWidth={2}
          />
        )
      case 'diamond':
        const points = [
          [w / 2, 0],
          [w, h / 2],
          [w / 2, h],
          [0, h / 2],
        ]
          .map((p) => p.join(','))
          .join(' ')
        return (
          <polygon
            points={points}
            fill="#fff"
            stroke={color || 'var(--violet)'}
            strokeWidth={2}
          />
        )
      case 'sticky':
        return (
          <g>
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill={color || '#ffe28a'}
              stroke="none"
              rx={4}
            />
            {shape.votes && shape.votes > 0 && (
              <g className="sticky-votes">
                {Array.from({ length: Math.min(shape.votes, 10) }).map((_, i) => (
                  <circle
                    key={i}
                    cx={14 + i * 14}
                    cy={h - 14}
                    r={5}
                    fill="var(--violet)"
                  />
                ))}
              </g>
            )}
          </g>
        )
      case 'text':
        return null // Text-only shapes don't have a shape element
      default:
        return <rect {...shapeProps} rx={10} ry={10} />
    }
  }

  const getLabelStyle = (): React.CSSProperties => {
    if (kind === 'sticky') {
      return {
        width: w,
        height: h,
        fontSize: '13px',
        fontWeight: 500,
        padding: '14px',
      }
    } else if (kind === 'text') {
      return {
        width: w,
        height: h,
        fontSize: '15px',
        fontWeight: 600,
      }
    }
    return {
      width: w,
      height: h,
      fontSize: '15px',
      fontWeight: 600,
    }
  }

  const textProps: React.TextareaHTMLAttributes<HTMLTextAreaElement> = {
    value: text,
    onChange: (e) => onTextChange(e.target.value),
    onBlur: onTextBlur,
    onKeyDown: (e) => {
      if (e.key === 'Escape' || (e.metaKey && e.key === 'Enter')) {
        onTextBlur()
      }
    },
    spellCheck: false,
  }

  const transform = `translate(${x}, ${y})${rotation ? ` rotate(${rotation} ${w / 2} ${h / 2})` : ''}`

  return (
    <g
      transform={transform}
      className={`shape ${isSelected ? 'selected' : ''} ${kind === 'sticky' ? 'shape-sticky' : ''} ${isConnectSource ? 'connect-source' : ''}`}
      data-shape-id={shape.id}
    >
      {kind !== 'text' && getShapeElement()}

      {/* Label / Text Area */}
      <foreignObject
        x={0}
        y={0}
        width={w}
        height={h}
        className={`shape-label ${kind === 'sticky' ? 'shape-label-sticky' : ''}`}
        style={{ pointerEvents: isEditing ? 'auto' : 'none' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            ...getLabelStyle(),
          }}
        >
          {isEditing ? (
            <textarea
              {...textProps}
              style={getLabelStyle()}
              ref={(el) => {
                // autoFocus is unreliable inside foreignObject
                if (el) setTimeout(() => el.focus(), 0)
              }}
            />
          ) : (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {text}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  )
})

export default ShapeView
