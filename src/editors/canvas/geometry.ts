import type { Shape, Side } from '../../lib/types'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Point {
  x: number
  y: number
}

export function shapeRect(shape: Shape): Rect {
  return { x: shape.x, y: shape.y, w: shape.w, h: shape.h }
}

export function bboxUnion(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null
  const xs = rects.flatMap((r) => [r.x, r.x + r.w])
  const ys = rects.flatMap((r) => [r.y, r.y + r.h])
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  const w = Math.max(...xs) - x
  const h = Math.max(...ys) - y
  return { x, y, w, h }
}

export function rectIntersect(r1: Rect, r2: Rect): boolean {
  return !(r1.x + r1.w < r2.x || r2.x + r2.w < r1.x || r1.y + r1.h < r2.y || r2.y + r2.h < r1.y)
}

export function pointInRect(p: Point, r: Rect): boolean {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h
}

const SIDE_NORMAL: Record<Side, Point> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
}

/** midpoint of a rect side */
export function sideAnchor(r: Rect, side: Side): Point {
  switch (side) {
    case 'top':
      return { x: r.x + r.w / 2, y: r.y }
    case 'bottom':
      return { x: r.x + r.w / 2, y: r.y + r.h }
    case 'left':
      return { x: r.x, y: r.y + r.h / 2 }
    case 'right':
      return { x: r.x + r.w, y: r.y + r.h / 2 }
  }
}

/** side of `r` that faces the point, weighted by aspect so wide shapes prefer top/bottom fairly */
export function facingSide(r: Rect, p: Point): Side {
  const dx = p.x - (r.x + r.w / 2)
  const dy = p.y - (r.y + r.h / 2)
  if (Math.abs(dx) / Math.max(r.w, 1) > Math.abs(dy) / Math.max(r.h, 1)) {
    return dx > 0 ? 'right' : 'left'
  }
  return dy > 0 ? 'bottom' : 'top'
}

function cubicAt(a: Point, c1: Point, c2: Point, b: Point, t: number): Point {
  const u = 1 - t
  return {
    x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
  }
}

export interface ConnectorCurve {
  path: string
  start: Point
  end: Point
  mid: Point
  /** polyline approximation for hit-testing */
  samples: Point[]
  fromSide: Side
  toSide: Side
}

/**
 * Smooth side-routed cubic bezier between two rects. Sides default to whichever
 * face of each shape points at the other, so curves re-route as shapes move.
 * Pass a zero-size rect as `to` to aim at a free point (drag preview).
 */
export function connectorCurve(from: Rect, to: Rect, fromSide?: Side, toSide?: Side): ConnectorCurve {
  const toC = { x: to.x + to.w / 2, y: to.y + to.h / 2 }
  const fromC = { x: from.x + from.w / 2, y: from.y + from.h / 2 }
  const fs = fromSide ?? facingSide(from, toC)
  const ts = toSide ?? facingSide(to, fromC)
  const a = sideAnchor(from, fs)
  const b = sideAnchor(to, ts)
  const na = SIDE_NORMAL[fs]
  const nb = SIDE_NORMAL[ts]
  const reach = Math.min(140, Math.max(30, Math.hypot(b.x - a.x, b.y - a.y) * 0.45))
  const c1 = { x: a.x + na.x * reach, y: a.y + na.y * reach }
  const c2 = { x: b.x + nb.x * reach, y: b.y + nb.y * reach }
  const samples: Point[] = []
  for (let i = 0; i <= 20; i++) samples.push(cubicAt(a, c1, c2, b, i / 20))
  return {
    path: `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`,
    start: a,
    end: b,
    mid: cubicAt(a, c1, c2, b, 0.5),
    samples,
    fromSide: fs,
    toSide: ts,
  }
}

export function distanceToPolyline(p: Point, pts: Point[]): number {
  let best = Infinity
  for (let i = 0; i < pts.length - 1; i++) {
    best = Math.min(best, distanceToSegment(p, pts[i], pts[i + 1]))
  }
  return best
}

/** Get connector endpoint: move from center towards target center until exiting shape bbox */
export function connectorEndpoint(from: Rect, to: Rect): Point {
  const fromC = { x: from.x + from.w / 2, y: from.y + from.h / 2 }
  const toC = { x: to.x + to.w / 2, y: to.y + to.h / 2 }
  const dx = toC.x - fromC.x
  const dy = toC.y - fromC.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist === 0) return fromC

  // Normalized direction
  const nx = dx / dist
  const ny = dy / dist

  // Find intersection with bbox edge by testing all four sides
  let t = Infinity
  if (nx > 0) t = Math.min(t, (from.x + from.w - fromC.x) / nx)
  if (nx < 0) t = Math.min(t, (from.x - fromC.x) / nx)
  if (ny > 0) t = Math.min(t, (from.y + from.h - fromC.y) / ny)
  if (ny < 0) t = Math.min(t, (from.y - fromC.y) / ny)

  return { x: fromC.x + nx * t, y: fromC.y + ny * t }
}

export function screenToCanvas(
  clientX: number,
  clientY: number,
  svgRect: DOMRect,
  viewport: { x: number; y: number; zoom: number },
): Point {
  const svgX = clientX - svgRect.left
  const svgY = clientY - svgRect.top
  return {
    x: (svgX - viewport.x) / viewport.zoom,
    y: (svgY - viewport.y) / viewport.zoom,
  }
}

/** shortest distance from a point to the segment a–b */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const lenSq = abx * abx + aby * aby
  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq))
  const cx = a.x + t * abx
  const cy = a.y + t * aby
  return Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)
}

export function distanceToPoint(p: Point, target: Point): number {
  const dx = p.x - target.x
  const dy = p.y - target.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function getResizeHandle(
  shapeRect: Rect,
  clickPoint: Point,
  handleSize: number = 10,
): 'tl' | 'tr' | 'bl' | 'br' | null {
  const threshold = handleSize / 2
  const corners = {
    tl: { x: shapeRect.x, y: shapeRect.y },
    tr: { x: shapeRect.x + shapeRect.w, y: shapeRect.y },
    bl: { x: shapeRect.x, y: shapeRect.y + shapeRect.h },
    br: { x: shapeRect.x + shapeRect.w, y: shapeRect.y + shapeRect.h },
  }

  for (const [corner, pt] of Object.entries(corners)) {
    if (
      clickPoint.x >= pt.x - threshold &&
      clickPoint.x <= pt.x + threshold &&
      clickPoint.y >= pt.y - threshold &&
      clickPoint.y <= pt.y + threshold
    ) {
      return corner as 'tl' | 'tr' | 'bl' | 'br'
    }
  }
  return null
}

export function applyResize(
  shape: Shape,
  corner: 'tl' | 'tr' | 'bl' | 'br',
  delta: Point,
  minW: number = 40,
  minH: number = 30,
): Shape {
  let { x, y, w, h } = shape
  const minWidth = minW
  const minHeight = minH

  if (corner === 'br') {
    w = Math.max(minWidth, w + delta.x)
    h = Math.max(minHeight, h + delta.y)
  } else if (corner === 'bl') {
    x = x + delta.x
    w = Math.max(minWidth, w - delta.x)
    h = Math.max(minHeight, h + delta.y)
  } else if (corner === 'tr') {
    y = y + delta.y
    w = Math.max(minWidth, w + delta.x)
    h = Math.max(minHeight, h - delta.y)
  } else if (corner === 'tl') {
    x = x + delta.x
    y = y + delta.y
    w = Math.max(minWidth, w - delta.x)
    h = Math.max(minHeight, h - delta.y)
  }

  return { ...shape, x, y, w, h }
}
