import { memo } from 'react'
import type { BoardContent, DocContent, Shape } from '../lib/types'
import type { Template } from '../lib/templates'
import { connectorCurve, shapeRect } from '../editors/canvas/geometry'

/** resolve the CSS-var colors used in shape data to real values for tiny previews */
const PREVIEW_COLORS: Record<string, string> = {
  'var(--violet)': '#7c5cff',
  'var(--teal)': '#2fa8a0',
  'var(--ink)': '#2a2830',
}
const resolve = (c: string) => PREVIEW_COLORS[c] ?? c

function ShapeMini({ shape }: { shape: Shape }) {
  const { kind, x, y, w, h, color } = shape
  const stroke = resolve(color)
  switch (kind) {
    case 'rect':
      return <rect x={x} y={y} width={w} height={h} rx={10} fill="#fff" stroke={stroke} strokeWidth={3} />
    case 'pill':
      return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="#fff" stroke={stroke} strokeWidth={3} />
    case 'ellipse':
      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="#fff" stroke={stroke} strokeWidth={3} />
    case 'diamond':
      return (
        <polygon
          points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`}
          fill="#fff"
          stroke={stroke}
          strokeWidth={3}
        />
      )
    case 'sticky':
      return (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={6}
          fill={stroke}
          transform={shape.rotation ? `rotate(${shape.rotation} ${x + w / 2} ${y + h / 2})` : undefined}
        />
      )
    case 'text':
      return <rect x={x} y={y + h / 2 - 4} width={Math.min(w, 150)} height={9} rx={4} fill="#c9c5d0" />
    default:
      // wf-* elements: light outlined boxes with a hint of their role
      if (kind === 'wf-button') return <rect x={x} y={y} width={w} height={h} rx={8} fill="#d5d2da" />
      if (kind === 'wf-image')
        return (
          <g>
            <rect x={x} y={y} width={w} height={h} rx={4} fill="#efedf2" stroke="#c9c5d0" strokeWidth={2} />
            <line x1={x} y1={y + h} x2={x + w} y2={y} stroke="#c9c5d0" strokeWidth={2} />
          </g>
        )
      if (kind === 'wf-text')
        return (
          <g>
            {[0.25, 0.55, 0.85].map(
              (f, i) =>
                f * h + 6 < h && (
                  <rect key={i} x={x} y={y + f * h - 3} width={w * (i === 2 ? 0.6 : 0.9)} height={6} rx={3} fill="#d5d2da" />
                ),
            )}
          </g>
        )
      return <rect x={x} y={y} width={w} height={h} rx={6} fill="#fbfafc" stroke="#c9c5d0" strokeWidth={2} />
  }
}

function BoardPreview({ content }: { content: BoardContent }) {
  if (content.shapes.length === 0) return null
  const xs = content.shapes.flatMap((s) => [s.x, s.x + s.w])
  const ys = content.shapes.flatMap((s) => [s.y, s.y + s.h])
  const pad = 30
  const minX = Math.min(...xs) - pad
  const minY = Math.min(...ys) - pad
  const w = Math.max(...xs) + pad - minX
  const h = Math.max(...ys) + pad - minY
  return (
    <svg viewBox={`${minX} ${minY} ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
      {content.connectors.map((c) => {
        const from = content.shapes.find((s) => s.id === c.from)
        const to = content.shapes.find((s) => s.id === c.to)
        if (!from || !to) return null
        const curve = connectorCurve(shapeRect(from), shapeRect(to), c.fromSide, c.toSide)
        return <path key={c.id} d={curve.path} stroke="#a09caa" strokeWidth={3} fill="none" />
      })}
      {content.shapes.map((s) => (
        <ShapeMini key={s.id} shape={s} />
      ))}
    </svg>
  )
}

function DocPreview({ content }: { content: DocContent }) {
  // page mock: heading bar + text lines, count loosely derived from the html
  const paragraphs = Math.min(8, Math.max(4, Math.round(content.html.length / 400)))
  return (
    <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid meet">
      <rect x={40} y={10} width={120} height={150} rx={6} fill="#fff" stroke="#e4e1e8" strokeWidth={2} />
      <rect x={54} y={26} width={70} height={9} rx={4} fill="#7c5cff" opacity={0.75} />
      {Array.from({ length: paragraphs }).map((_, i) => (
        <rect
          key={i}
          x={54}
          y={46 + i * 12}
          width={i % 3 === 2 ? 55 : 92}
          height={5}
          rx={2.5}
          fill="#d5d2da"
        />
      ))}
    </svg>
  )
}

const TemplatePreview = memo(function TemplatePreview({ template }: { template: Template }) {
  return (
    <div className="template-preview dot-grid">
      {template.type === 'doc' ? (
        <DocPreview content={template.content as DocContent} />
      ) : (
        <BoardPreview content={template.content as BoardContent} />
      )}
    </div>
  )
})

export default TemplatePreview
