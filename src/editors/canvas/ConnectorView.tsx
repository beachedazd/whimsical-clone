import { memo } from 'react'
import type { Connector, Shape } from '../../lib/types'
import { shapeRect, connectorEndpoint } from './geometry'

interface ConnectorViewProps {
  connector: Connector
  fromShape: Shape
  toShape: Shape
  isSelected: boolean
  onDoubleClick: () => void
}

const ConnectorView = memo(function ConnectorView({
  connector,
  fromShape,
  toShape,
  isSelected,
  onDoubleClick,
}: ConnectorViewProps) {
  const fromRect = shapeRect(fromShape)
  const toRect = shapeRect(toShape)

  // Calculate endpoints on shape borders
  const fromEnd = connectorEndpoint(fromRect, toRect)
  const toEnd = connectorEndpoint(toRect, fromRect)

  // Calculate label position at midpoint
  const labelX = (fromEnd.x + toEnd.x) / 2
  const labelY = (fromEnd.y + toEnd.y) / 2

  const getLabelColor = () => {
    if (connector.label === 'Yes') return 'yes'
    if (connector.label === 'No') return 'no'
    return 'neutral'
  }

  return (
    <g className="connector" data-connector-id={connector.id}>
      {/* Connector line with arrowhead */}
      <line
        x1={fromEnd.x}
        y1={fromEnd.y}
        x2={toEnd.x}
        y2={toEnd.y}
        stroke="#a09caa"
        strokeWidth={2}
        fill="none"
        markerEnd="url(#arrow-default)"
        pointerEvents="auto"
        style={{ cursor: 'pointer' }}
        onDoubleClick={onDoubleClick}
        opacity={isSelected ? 0.8 : 1}
        strokeDasharray={isSelected ? '4' : 'none'}
      />

      {/* Label if present */}
      {connector.label && (
        <foreignObject
          x={labelX - 30}
          y={labelY - 12}
          width={60}
          height={24}
          pointerEvents="auto"
          className="connector-label-container"
        >
          <div
            className={`connector-label ${getLabelColor()}`}
            onDoubleClick={(e) => {
              e.stopPropagation()
              onDoubleClick()
            }}
          >
            {connector.label}
          </div>
        </foreignObject>
      )}
    </g>
  )
})

export default ConnectorView
