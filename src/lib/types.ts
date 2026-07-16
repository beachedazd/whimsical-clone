export type FileType = 'flowchart' | 'wireframe' | 'sticky' | 'doc'

export interface Workspace {
  id: string
  name: string
  owner_id: string
  created_at: string
}

/** "Projects" in the UI (design mock 1b sidebar) — folders table in the DB. */
export interface Folder {
  id: string
  workspace_id: string
  name: string
  created_at: string
}

export interface FileRow {
  id: string
  workspace_id: string
  folder_id: string | null
  type: FileType
  title: string
  content: BoardContent | DocContent | Record<string, never>
  created_by: string
  created_at: string
  updated_at: string
}

// --- Canvas (flowchart / wireframe / sticky) ---
export type ShapeKind =
  // flowchart
  | 'rect'
  | 'pill'
  | 'diamond'
  | 'ellipse'
  | 'text'
  | 'sticky'
  // wireframe elements
  | 'wf-button'
  | 'wf-input'
  | 'wf-text'
  | 'wf-image'
  | 'wf-toggle'
  | 'wf-tabs'
  | 'wf-phone'

export interface Shape {
  id: string
  kind: ShapeKind
  x: number
  y: number
  w: number
  h: number
  text: string
  /** border/accent color for flowchart shapes; sticky note background for stickies */
  color: string
  rotation?: number
  /** vote dots on sticky notes (design mock 1f) */
  votes?: number
}

export type Side = 'top' | 'right' | 'bottom' | 'left'

export interface Connector {
  id: string
  from: string // shape id
  to: string // shape id
  label?: string
  labelColor?: string
  /** attachment sides; omitted = auto-routed from relative shape positions */
  fromSide?: Side
  toSide?: Side
}

export interface BoardContent {
  shapes: Shape[]
  connectors: Connector[]
}

// --- Doc ---
export interface DocContent {
  html: string
}

export const emptyContent = (type: FileType): BoardContent | DocContent => {
  if (type === 'doc') return { html: '' }
  return { shapes: [], connectors: [] }
}

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  flowchart: 'Flowchart',
  wireframe: 'Wireframe',
  sticky: 'Sticky board',
  doc: 'Doc',
}

/** Sticky note palette from design mock 1f */
export const STICKY_COLORS = ['#ffe28a', '#ffb3c1', '#a8e6cf', '#b7d8ff'] as const

/** Flowchart shape accent colors from design mocks */
export const SHAPE_COLORS = {
  violet: 'var(--violet)',
  teal: 'var(--teal)',
  amber: '#e8b24a',
  red: '#c05b5b',
} as const
