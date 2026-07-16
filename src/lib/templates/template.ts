import type {
  BoardContent,
  Connector,
  DocContent,
  FileType,
  Shape,
  ShapeKind,
  Side,
} from '../types'

export interface Template {
  /** unique kebab-case id */
  id: string
  name: string
  /** one-line description shown on the gallery card */
  description: string
  type: FileType
  content: BoardContent | DocContent
}

// ---- builder helpers for template data modules ----

/** generic shape */
export function node(
  id: string,
  kind: ShapeKind,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  color = 'var(--violet)',
): Shape {
  return { id, kind, x, y, w, h, text, color }
}

/** flowchart process step: violet rounded rect 190x64 */
export function step(id: string, x: number, y: number, text: string): Shape {
  return node(id, 'rect', x, y, 190, 64, text)
}

/** flowchart start/end: teal pill 190x64 */
export function terminal(id: string, x: number, y: number, text: string): Shape {
  return node(id, 'pill', x, y, 190, 64, text, 'var(--teal)')
}

/** flowchart decision: amber diamond 170x120 */
export function decision(id: string, x: number, y: number, text: string): Shape {
  return node(id, 'diamond', x, y, 170, 120, text, '#e8b24a')
}

/** free-floating text label (section headers, annotations) */
export function label(id: string, x: number, y: number, text: string, w = 220, h = 32): Shape {
  return node(id, 'text', x, y, w, h, text, 'var(--ink)')
}

/** sticky note 170x120 with a slight random-looking rotation for a hand-placed feel */
export function sticky(id: string, x: number, y: number, text: string, color: string): Shape {
  const rotations = [-1.6, 1.2, -0.8, 1.8, -1.2, 0.6]
  const rotation = rotations[hashCode(id) % rotations.length]
  return { id, kind: 'sticky', x, y, w: 170, h: 120, text, color, rotation }
}

/** wireframe element (wf-button, wf-input, wf-text, wf-image, wf-toggle, wf-tabs, wf-phone) */
export function wf(
  id: string,
  kind: ShapeKind,
  x: number,
  y: number,
  w: number,
  h: number,
  text = '',
): Shape {
  return node(id, kind, x, y, w, h, text, '#b6b2bd')
}

/** connector between two shape ids; id derived, sides auto-routed unless given */
export function edge(from: string, to: string, edgeLabel?: string, fromSide?: Side): Connector {
  return {
    id: `e-${from}-${to}`,
    from,
    to,
    ...(edgeLabel ? { label: edgeLabel } : {}),
    ...(fromSide ? { fromSide } : {}),
  }
}

export function board(shapes: Shape[], connectors: Connector[] = []): BoardContent {
  return { shapes, connectors }
}

export function doc(html: string): DocContent {
  return { html }
}

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}
