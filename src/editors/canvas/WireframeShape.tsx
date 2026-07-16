import type { Shape } from '../../lib/types'

interface WireframeShapeProps {
  shape: Shape
}

export default function WireframeShape({ shape }: WireframeShapeProps) {
  const { kind, w, h, text } = shape

  switch (kind) {
    case 'wf-button': {
      return (
        <g>
          {/* Dark rounded rect background */}
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill="var(--ink)"
            rx={10}
            ry={10}
          />
          {/* Centered white text */}
          <text
            x={w / 2}
            y={h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="#fff"
            fontWeight={600}
          >
            {text || 'Button'}
          </text>
        </g>
      )
    }

    case 'wf-input': {
      return (
        <g>
          {/* White rect with border */}
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill="#fff"
            stroke="#b6b2bd"
            strokeWidth={1.5}
            rx={8}
            ry={8}
          />
          {/* Left-aligned text */}
          <text
            x={12}
            y={h / 2}
            dominantBaseline="central"
            fontSize={11}
            fill="#a09caa"
            fontWeight={400}
          >
            {text || 'Input'}
          </text>
        </g>
      )
    }

    case 'wf-text': {
      const barSpacing = h / 4
      const lineHeights = [8, 8, 8]
      const lineWidths = [1, 0.8, 0.6]
      const lineColors = ['#b6b2bd', '#d9d6d0', '#d9d6d0']

      return (
        <g>
          {lineHeights.map((lineH, i) => (
            <rect
              key={i}
              x={0}
              y={barSpacing * (i + 1) - lineH / 2}
              width={w * lineWidths[i]}
              height={lineH}
              fill={lineColors[i]}
              rx={3}
              ry={3}
            />
          ))}
        </g>
      )
    }

    case 'wf-image': {
      return (
        <g>
          {/* Rect with border */}
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill="none"
            stroke="#d9d6d0"
            strokeWidth={1.5}
            rx={8}
            ry={8}
          />
          {/* Diagonal lines */}
          <line
            x1={0}
            y1={0}
            x2={w}
            y2={h}
            stroke="#d9d6d0"
            strokeWidth={1.5}
          />
          <line
            x1={w}
            y1={0}
            x2={0}
            y2={h}
            stroke="#d9d6d0"
            strokeWidth={1.5}
          />
        </g>
      )
    }

    case 'wf-toggle': {
      return (
        <g>
          {/* Pill shape */}
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill="var(--teal)"
            rx={h / 2}
            ry={h / 2}
          />
          {/* White knob on the right */}
          <circle
            cx={w - h / 2 + 2}
            cy={h / 2}
            r={h / 2 - 2}
            fill="#fff"
          />
        </g>
      )
    }

    case 'wf-tabs': {
      const cellWidth = w / 3

      return (
        <g>
          {/* Main rect border */}
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill="none"
            stroke="#b6b2bd"
            strokeWidth={1.5}
            rx={6}
            ry={6}
          />

          {/* First cell fill */}
          <rect
            x={0}
            y={0}
            width={cellWidth}
            height={h}
            fill="#efede8"
            rx={6}
            ry={6}
          />

          {/* Vertical dividers */}
          <line
            x1={cellWidth}
            y1={0}
            x2={cellWidth}
            y2={h}
            stroke="#b6b2bd"
            strokeWidth={1.5}
          />
          <line
            x1={cellWidth * 2}
            y1={0}
            x2={cellWidth * 2}
            y2={h}
            stroke="#b6b2bd"
            strokeWidth={1.5}
          />
        </g>
      )
    }

    case 'wf-phone': {
      const statusBarHeight = 10
      const statusBarWidth = 60
      const statusBarX = 18
      const statusBarY = 18

      const tabBarY = h - 58
      const tabSize = 16
      const tabSpacing = (w - 3 * tabSize) / 4

      return (
        <g>
          {/* Phone frame */}
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill="none"
            stroke="#2a2830"
            strokeWidth={2}
            rx={24}
            ry={24}
          />

          {/* Status bar */}
          <rect
            x={statusBarX}
            y={statusBarY}
            width={statusBarWidth}
            height={statusBarHeight}
            fill="#2a2830"
            rx={3}
            ry={3}
          />

          {/* Tab bar divider line */}
          <line
            x1={0}
            y1={tabBarY}
            x2={w}
            y2={tabBarY}
            stroke="#e0ddd7"
            strokeWidth={1.5}
          />

          {/* Tab bar icons */}
          {[0, 1, 2].map((i) => {
            const iconX = tabSpacing + i * (tabSpacing + tabSize) + tabSize / 2
            const iconY = h - 29

            if (i === 0) {
              return (
                <rect
                  key={i}
                  x={iconX - tabSize / 2}
                  y={iconY - tabSize / 2}
                  width={tabSize}
                  height={tabSize}
                  fill="#2a2830"
                  rx={4}
                  ry={4}
                />
              )
            } else {
              return (
                <rect
                  key={i}
                  x={iconX - tabSize / 2}
                  y={iconY - tabSize / 2}
                  width={tabSize}
                  height={tabSize}
                  fill="none"
                  stroke="#b6b2bd"
                  strokeWidth={2}
                  rx={4}
                  ry={4}
                />
              )
            }
          })}
        </g>
      )
    }

    default:
      return (
        <rect
          x={0}
          y={0}
          width={w}
          height={h}
          fill="#fff"
          stroke="var(--border)"
          strokeWidth={1.5}
          rx={8}
          ry={8}
        />
      )
  }
}
