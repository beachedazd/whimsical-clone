import { useCallback, useEffect, useRef, useState } from 'react'
import type { BoardContent, Connector, Shape, ShapeKind } from '../../lib/types'
import {
  applyResize,
  getResizeHandle,
  pointInRect,
  rectIntersect,
  screenToCanvas,
  shapeRect,
} from './geometry'
import ShapeView from './ShapeView'
import ConnectorView from './ConnectorView'

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface BoardCanvasProps {
  content: BoardContent
  selection: string[]
  tool: string
  viewport: Viewport
  editingId: string | null
  connectFrom: string | null
  /** fill color for newly placed sticky notes */
  stickyColor?: string
  onSelectionChange: (ids: string[]) => void
  /** atomic change → one undo step */
  onCommit: (next: BoardContent) => void
  /** mid-gesture change → no undo step */
  onTransient: (next: BoardContent) => void
  /** gesture finished: base = content at gesture start */
  onGestureEnd: (base: BoardContent) => void
  onViewportChange: (viewport: Viewport) => void
  onEditingChange: (id: string | null) => void
  onConnectFromChange: (id: string | null) => void
  onToolChange: (tool: string) => void
}

interface DragState {
  type: 'move' | 'resize' | 'marquee' | 'pan'
  base: BoardContent
  startX: number
  startY: number
  moved: boolean
  startPositions?: Map<string, { x: number; y: number }>
  resizeCorner?: 'tl' | 'tr' | 'bl' | 'br'
  resizeShapeId?: string
  resizeStart?: Shape
}

const SHAPE_DEFAULTS: Record<string, [number, number]> = {
  rect: [190, 64],
  pill: [190, 64],
  diamond: [130, 110],
  ellipse: [160, 90],
  text: [160, 32],
  sticky: [170, 120],
}

const isTypingTarget = (t: EventTarget | null) =>
  t instanceof HTMLElement &&
  (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)

export default function BoardCanvas({
  content,
  selection,
  tool,
  viewport,
  editingId,
  connectFrom,
  stickyColor,
  onSelectionChange,
  onCommit,
  onTransient,
  onGestureEnd,
  onViewportChange,
  onEditingChange,
  onConnectFromChange,
  onToolChange,
}: BoardCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [spaceDown, setSpaceDown] = useState(false)

  // refs so native listeners always see the latest values
  const viewportRef = useRef(viewport)
  viewportRef.current = viewport
  const contentRef = useRef(content)
  contentRef.current = content

  const getShape = (id: string) => contentRef.current.shapes.find((s) => s.id === id)

  const toCanvas = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect()
    return screenToCanvas(clientX, clientY, rect, viewportRef.current)
  }

  /** topmost shape under a canvas point */
  const shapeAt = (p: { x: number; y: number }) => {
    const shapes = contentRef.current.shapes
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (pointInRect(p, shapeRect(shapes[i]))) return shapes[i]
    }
    return null
  }

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || editingId) return
    if (e.button === 2) return
    const cur = contentRef.current
    const p = toCanvas(e.clientX, e.clientY)

    // pan: space held or middle mouse button
    if (spaceDown || e.button === 1) {
      dragRef.current = { type: 'pan', base: cur, startX: e.clientX, startY: e.clientY, moved: false }
      svgRef.current.setPointerCapture(e.pointerId)
      return
    }

    // shape-creation tools work anywhere on the canvas
    if (tool in SHAPE_DEFAULTS) {
      const [dw, dh] = SHAPE_DEFAULTS[tool]
      const newShape: Shape = {
        id: crypto.randomUUID(),
        kind: tool as ShapeKind,
        x: Math.round(p.x - dw / 2),
        y: Math.round(p.y - dh / 2),
        w: dw,
        h: dh,
        text: '',
        color:
          tool === 'sticky'
            ? (stickyColor ?? '#ffe28a')
            : tool === 'diamond'
              ? '#e8b24a'
              : 'var(--violet)',
        ...(tool === 'sticky' ? { rotation: Math.round((Math.random() * 4 - 2) * 10) / 10 } : {}),
      }
      onCommit({ ...cur, shapes: [...cur.shapes, newShape] })
      onSelectionChange([newShape.id])
      onEditingChange(newShape.id)
      onToolChange('select')
      return
    }

    const hit = shapeAt(p)

    if (tool === 'connector') {
      if (!hit) {
        onConnectFromChange(null)
        return
      }
      if (connectFrom === null) {
        onConnectFromChange(hit.id)
      } else if (connectFrom !== hit.id) {
        const connector: Connector = { id: crypto.randomUUID(), from: connectFrom, to: hit.id }
        onCommit({ ...cur, connectors: [...cur.connectors, connector] })
        onConnectFromChange(null)
        onToolChange('select')
      }
      return
    }

    // select tool
    // resize handle on the single selected shape?
    if (selection.length === 1) {
      const sel = getShape(selection[0])
      if (sel) {
        const handle = getResizeHandle(shapeRect(sel), p, 14 / viewportRef.current.zoom)
        if (handle) {
          dragRef.current = {
            type: 'resize',
            base: cur,
            startX: e.clientX,
            startY: e.clientY,
            moved: false,
            resizeCorner: handle,
            resizeShapeId: sel.id,
            resizeStart: sel,
          }
          svgRef.current.setPointerCapture(e.pointerId)
          return
        }
      }
    }

    if (hit) {
      // compute the selection this drag applies to (state update is async)
      let nextSelection: string[]
      if (e.shiftKey) {
        nextSelection = selection.includes(hit.id)
          ? selection.filter((id) => id !== hit.id)
          : [...selection, hit.id]
      } else {
        nextSelection = selection.includes(hit.id) ? selection : [hit.id]
      }
      onSelectionChange(nextSelection)

      dragRef.current = {
        type: 'move',
        base: cur,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        startPositions: new Map(
          cur.shapes
            .filter((s) => nextSelection.includes(s.id))
            .map((s) => [s.id, { x: s.x, y: s.y }]),
        ),
      }
      svgRef.current.setPointerCapture(e.pointerId)
      return
    }

    // empty canvas: marquee
    if (!e.shiftKey) onSelectionChange([])
    dragRef.current = { type: 'marquee', base: cur, startX: p.x, startY: p.y, moved: false }
    setMarquee({ x: p.x, y: p.y, w: 0, h: 0 })
    svgRef.current.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current
    if (!drag || !svgRef.current) return
    drag.moved = true
    const cur = contentRef.current
    const zoom = viewportRef.current.zoom

    if (drag.type === 'move' && drag.startPositions) {
      const dx = (e.clientX - drag.startX) / zoom
      const dy = (e.clientY - drag.startY) / zoom
      onTransient({
        ...cur,
        shapes: cur.shapes.map((s) => {
          const start = drag.startPositions!.get(s.id)
          return start ? { ...s, x: Math.round(start.x + dx), y: Math.round(start.y + dy) } : s
        }),
      })
    } else if (drag.type === 'resize' && drag.resizeStart) {
      const dx = (e.clientX - drag.startX) / zoom
      const dy = (e.clientY - drag.startY) / zoom
      const resized = applyResize(drag.resizeStart, drag.resizeCorner!, { x: dx, y: dy })
      onTransient({
        ...cur,
        shapes: cur.shapes.map((s) => (s.id === drag.resizeShapeId ? resized : s)),
      })
    } else if (drag.type === 'marquee') {
      const p = toCanvas(e.clientX, e.clientY)
      setMarquee({
        x: Math.min(drag.startX, p.x),
        y: Math.min(drag.startY, p.y),
        w: Math.abs(p.x - drag.startX),
        h: Math.abs(p.y - drag.startY),
      })
    } else if (drag.type === 'pan') {
      const vp = viewportRef.current
      onViewportChange({ ...vp, x: vp.x + e.clientX - drag.startX, y: vp.y + e.clientY - drag.startY })
      drag.startX = e.clientX
      drag.startY = e.clientY
    }
  }

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag || !svgRef.current) return
    if (svgRef.current.hasPointerCapture(e.pointerId)) {
      svgRef.current.releasePointerCapture(e.pointerId)
    }

    if (drag.type === 'marquee') {
      if (marquee && (marquee.w > 2 || marquee.h > 2)) {
        onSelectionChange(
          contentRef.current.shapes
            .filter((s) => rectIntersect(shapeRect(s), marquee))
            .map((s) => s.id),
        )
      }
      setMarquee(null)
      return
    }

    // one undo step per completed move/resize gesture
    if ((drag.type === 'move' || drag.type === 'resize') && drag.moved) {
      onGestureEnd(drag.base)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (editingId) return
    const p = toCanvas(e.clientX, e.clientY)
    const hit = shapeAt(p)
    if (hit) {
      onSelectionChange([hit.id])
      onEditingChange(hit.id)
    }
  }

  // native wheel listener — React root wheel handlers are passive, preventDefault needs this
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const vp = viewportRef.current
      if (e.ctrlKey || e.metaKey) {
        const rect = svg.getBoundingClientRect()
        const ax = e.clientX - rect.left
        const ay = e.clientY - rect.top
        const canvasX = (ax - vp.x) / vp.zoom
        const canvasY = (ay - vp.y) / vp.zoom
        const zoom = Math.max(0.1, Math.min(4, vp.zoom * (e.deltaY > 0 ? 0.92 : 1.08)))
        onViewportChange({ x: ax - canvasX * zoom, y: ay - canvasY * zoom, zoom })
      } else {
        onViewportChange({ ...vp, x: vp.x - e.deltaX, y: vp.y - e.deltaY })
      }
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [onViewportChange])

  // keyboard: delete / escape / nudge / space-pan (undo & redo live in CanvasEditor)
  const deleteSelection = useCallback(() => {
    const cur = contentRef.current
    if (selection.length === 0) return
    const remaining = new Set(
      cur.shapes.filter((s) => !selection.includes(s.id)).map((s) => s.id),
    )
    onCommit({
      shapes: cur.shapes.filter((s) => remaining.has(s.id)),
      connectors: cur.connectors.filter(
        (c) => !selection.includes(c.id) && remaining.has(c.from) && remaining.has(c.to),
      ),
    })
    onSelectionChange([])
  }, [selection, onCommit, onSelectionChange])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTypingTarget(e.target)) {
        setSpaceDown(true)
        e.preventDefault()
        return
      }
      if (editingId || isTypingTarget(e.target)) return

      if (e.key === 'Escape') {
        onSelectionChange([])
        onConnectFromChange(null)
        if (tool !== 'select') onToolChange('select')
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelection()
      } else if (e.key.startsWith('Arrow') && selection.length > 0) {
        e.preventDefault()
        const d = e.shiftKey ? 10 : 1
        const dx = e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0
        const dy = e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0
        const cur = contentRef.current
        onCommit({
          ...cur,
          shapes: cur.shapes.map((s) =>
            selection.includes(s.id) ? { ...s, x: s.x + dx, y: s.y + dy } : s,
          ),
        })
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [editingId, selection, tool, deleteSelection, onSelectionChange, onConnectFromChange, onToolChange, onCommit])

  const editConnectorLabel = (connector: Connector) => {
    const label = window.prompt('Connector label', connector.label ?? '')
    if (label === null) return
    const cur = contentRef.current
    onCommit({
      ...cur,
      connectors: cur.connectors.map((c) => (c.id === connector.id ? { ...c, label } : c)),
    })
  }

  const cursor =
    spaceDown || dragRef.current?.type === 'pan'
      ? 'grab'
      : tool === 'select'
        ? 'default'
        : 'crosshair'

  return (
    <div
      className="canvas-viewport dot-grid"
      style={{
        backgroundSize: `${26 * viewport.zoom}px ${26 * viewport.zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
    >
      <svg
        ref={svgRef}
        className="canvas-svg"
        width="100%"
        height="100%"
        style={{ cursor }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
      >
        <defs>
          <marker
            id="arrow-default"
            markerWidth="10"
            markerHeight="8"
            refX="8"
            refY="4"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,8 L9,4 z" fill="#a09caa" />
          </marker>
        </defs>

        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
          {content.connectors.map((connector) => {
            const fromShape = content.shapes.find((s) => s.id === connector.from)
            const toShape = content.shapes.find((s) => s.id === connector.to)
            if (!fromShape || !toShape) return null
            return (
              <ConnectorView
                key={connector.id}
                connector={connector}
                fromShape={fromShape}
                toShape={toShape}
                isSelected={selection.includes(connector.id)}
                onDoubleClick={() => editConnectorLabel(connector)}
              />
            )
          })}

          {content.shapes.map((shape) => (
            <ShapeView
              key={shape.id}
              shape={shape}
              isSelected={selection.includes(shape.id)}
              isEditing={editingId === shape.id}
              isConnectSource={connectFrom === shape.id}
              onTextChange={(text) => {
                const cur = contentRef.current
                onTransient({
                  ...cur,
                  shapes: cur.shapes.map((s) => (s.id === shape.id ? { ...s, text } : s)),
                })
              }}
              onTextBlur={() => onEditingChange(null)}
            />
          ))}

          {/* selection outlines + handles */}
          {selection.map((id) => {
            const shape = content.shapes.find((s) => s.id === id)
            if (!shape) return null
            const r = shapeRect(shape)
            const pad = 4
            return (
              <g key={`sel-${id}`} className="selection-layer">
                <rect
                  x={r.x - pad}
                  y={r.y - pad}
                  width={r.w + pad * 2}
                  height={r.h + pad * 2}
                  fill="none"
                  stroke="var(--violet)"
                  strokeWidth={2 / viewport.zoom}
                  rx={8}
                  pointerEvents="none"
                />
                {selection.length === 1 &&
                  (
                    [
                      [r.x - pad, r.y - pad],
                      [r.x + r.w + pad, r.y - pad],
                      [r.x - pad, r.y + r.h + pad],
                      [r.x + r.w + pad, r.y + r.h + pad],
                    ] as const
                  ).map(([cx, cy], i) => (
                    <rect
                      key={i}
                      x={cx - 5}
                      y={cy - 5}
                      width={10}
                      height={10}
                      rx={3}
                      fill="#fff"
                      stroke="var(--violet)"
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                  ))}
              </g>
            )
          })}

          {marquee && (
            <rect
              x={marquee.x}
              y={marquee.y}
              width={marquee.w}
              height={marquee.h}
              fill="rgba(97, 87, 255, 0.08)"
              stroke="var(--violet)"
              strokeWidth={1 / viewport.zoom}
              pointerEvents="none"
            />
          )}
        </g>
      </svg>
    </div>
  )
}
