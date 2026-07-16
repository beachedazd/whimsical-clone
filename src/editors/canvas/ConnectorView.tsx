import { memo } from 'react'
import type { Connector, Shape } from '../../lib/types'
import { shapeRect, connectorCurve } from './geometry'

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
  const curve = connectorCurve(
    shapeRect(fromShape),
    shapeRect(toShape),
    connector.fromSide,
    connector.toSide,
  )

  const getLabelColor = () => {
    if (connector.label === 'Yes') return 'yes'
    if (connector.label === 'No') return 'no'
    return 'neutral'
  }

  return (
    <g className="connector" data-connector-id={connector.id}>
      {/* wide invisible hit area so the line is easy to click */}
      <path
        d={curve.path}
        stroke="transparent"
        strokeWidth={16}
        fill="none"
        pointerEvents="stroke"
        style={{ cursor: 'pointer' }}
        onDoubleClick={onDoubleClick}
      />
      {/* visible curve with arrowhead */}
      <path
        d={curve.path}
        stroke={isSelected ? 'var(--violet)' : '#a09caa'}
        strokeWidth={2}
        fill="none"
        markerEnd={isSelected ? 'url(#arrow-selected)' : 'url(#arrow-default)'}
        pointerEvents="none"
      />

      {/* Label if present */}
      {connector.label && (
        <foreignObject
          x={curve.mid.x - 30}
          y={curve.mid.y - 12}
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
