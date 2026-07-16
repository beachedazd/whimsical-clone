import type { Shape } from '../../lib/types'

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
