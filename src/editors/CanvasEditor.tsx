import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { BoardContent, FileRow } from '../lib/types'
import { getFile, renameFile, updateFileContent } from '../lib/api'
import { useHistory } from './canvas/useHistory'
import BoardCanvas from './canvas/BoardCanvas'
import type { Viewport } from './canvas/BoardCanvas'
import './canvas.css'

type Tool = 'select' | 'rect' | 'pill' | 'diamond' | 'ellipse' | 'text' | 'sticky' | 'connector'
type SaveState = 'saved' | 'saving' | 'dirty'

const TOOLS: { id: Tool; title: string; icon: string }[] = [
  { id: 'select', title: 'Select (V)', icon: 'icon-select' },
  { id: 'rect', title: 'Rectangle', icon: 'icon-rect' },
  { id: 'pill', title: 'Pill', icon: 'icon-pill' },
  { id: 'ellipse', title: 'Ellipse', icon: 'icon-ellipse' },
  { id: 'diamond', title: 'Diamond', icon: 'icon-diamond' },
  { id: 'connector', title: 'Connector', icon: 'icon-connector' },
  { id: 'text', title: 'Text', icon: 'icon-text' },
  { id: 'sticky', title: 'Sticky note', icon: 'icon-sticky' },
]

const isTypingTarget = (t: EventTarget | null) =>
  t instanceof HTMLElement &&
  (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)

export default function CanvasEditor() {
  const { id } = useParams<{ id: string }>()
  const [file, setFile] = useState<FileRow | null>(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { content, contentRef, setContent, commit, commitFrom, undo, redo, reset } = useHistory({
    shapes: [],
    connectors: [],
  })

  const [selection, setSelection] = useState<string[]>([])
  const [tool, setTool] = useState<Tool>('select')
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [connectFrom, setConnectFrom] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [shareFlash, setShareFlash] = useState(false)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const fileIdRef = useRef<string | undefined>(id)
  fileIdRef.current = id

  // --- load ---
  useEffect(() => {
    if (!id) return
    setLoading(true)
    getFile(id)
      .then((f) => {
        setFile(f)
        setTitle(f.title)
        const c = f.content as BoardContent
        reset(c && Array.isArray(c.shapes) ? c : { shapes: [], connectors: [] })
        setSaveState('saved')
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load file:', err)
        setError('Could not load this board.')
        setLoading(false)
      })
  }, [id, reset])

  // --- save machinery ---
  const doSave = useCallback(async () => {
    const fid = fileIdRef.current
    if (!fid) return
    const snapshot = contentRef.current
    setSaveState('saving')
    try {
      await updateFileContent(fid, snapshot)
      setLastSavedAt(new Date())
      // if more edits arrived while saving, their scheduleSave keeps us dirty
      setSaveState(contentRef.current === snapshot ? 'saved' : 'dirty')
    } catch (err) {
      console.error('Save failed:', err)
      setSaveState('dirty')
    }
  }, [contentRef])

  const scheduleSave = useCallback(() => {
    setSaveState('dirty')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(doSave, 800)
  }, [doSave])

  // mutation wrappers passed to the canvas
  const handleCommit = useCallback(
    (next: BoardContent) => {
      commit(next)
      scheduleSave()
    },
    [commit, scheduleSave],
  )
  const handleTransient = useCallback(
    (next: BoardContent) => {
      setContent(next)
      scheduleSave()
    },
    [setContent, scheduleSave],
  )
  const handleGestureEnd = useCallback(
    (base: BoardContent) => {
      // content already holds the final state; record one undo step for the gesture
      commitFrom(base, contentRef.current)
      scheduleSave()
    },
    [commitFrom, contentRef, scheduleSave],
  )

  // flush on unmount / warn on close with unsaved changes
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveTimer.current) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
        const fid = fileIdRef.current
        if (fid) void updateFileContent(fid, contentRef.current).catch(console.error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- undo/redo keyboard ---
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || isTypingTarget(e.target)) return
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault()
        const changed = e.shiftKey ? redo() : undo()
        if (changed) scheduleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo, scheduleSave])

  // --- title ---
  const commitTitle = useCallback(() => {
    if (!file || title === file.title) return
    const next = title.trim() || 'Untitled'
    setTitle(next)
    setFile({ ...file, title: next })
    renameFile(file.id, next).catch((err) => console.error('Rename failed:', err))
  }, [file, title])

  // --- zoom controls (keep viewport center fixed) ---
  const zoomBy = (factor: number) => {
    const vp = document.querySelector<HTMLElement>('.canvas-viewport')
    if (!vp) return
    const cx = vp.clientWidth / 2
    const cy = vp.clientHeight / 2
    const canvasX = (cx - viewport.x) / viewport.zoom
    const canvasY = (cy - viewport.y) / viewport.zoom
    const zoom = Math.max(0.1, Math.min(4, viewport.zoom * factor))
    setViewport({ x: cx - canvasX * zoom, y: cy - canvasY * zoom, zoom })
  }

  const zoomFit = () => {
    const vp = document.querySelector<HTMLElement>('.canvas-viewport')
    if (!vp || content.shapes.length === 0) {
      setViewport({ x: 0, y: 0, zoom: 1 })
      return
    }
    const xs = content.shapes.flatMap((s) => [s.x, s.x + s.w])
    const ys = content.shapes.flatMap((s) => [s.y, s.y + s.h])
    const minX = Math.min(...xs) - 80
    const minY = Math.min(...ys) - 80
    const w = Math.max(...xs) + 80 - minX
    const h = Math.max(...ys) + 80 - minY
    const zoom = Math.max(0.1, Math.min(vp.clientWidth / w, vp.clientHeight / h, 1.5))
    setViewport({
      x: (vp.clientWidth - w * zoom) / 2 - minX * zoom,
      y: (vp.clientHeight - h * zoom) / 2 - minY * zoom,
      zoom,
    })
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareFlash(true)
      setTimeout(() => setShareFlash(false), 1600)
    } catch (err) {
      console.error('Clipboard failed:', err)
    }
  }

  const statusText = () => {
    if (saveState === 'saving') return 'Saving…'
    if (saveState === 'dirty') return 'Unsaved changes'
    if (lastSavedAt) {
      const mins = Math.floor((Date.now() - lastSavedAt.getTime()) / 60000)
      return mins < 1 ? 'Saved · just now' : `Saved · ${mins}m ago`
    }
    return 'Saved'
  }

  if (loading) return <div className="app-loading">Loading…</div>
  if (error || !file) return <div className="app-loading">{error ?? 'Board not found'}</div>

  return (
    <div className="canvas-editor">
      <div className="canvas-topbar">
        <Link to="/home" className="canvas-topbar-logo" title="Back to home">
          <div className="logo-mark" style={{ width: 24, height: 24 }} />
        </Link>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="canvas-topbar-title"
          aria-label="Board title"
        />
        <div className="canvas-topbar-status">{statusText()}</div>
        <div className="canvas-topbar-spacer" />
        <button className="btn-primary canvas-topbar-share" onClick={share}>
          {shareFlash ? 'Link copied' : 'Share'}
        </button>
      </div>

      <div className="canvas-container">
        <div className="canvas-toolbar">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={`toolbar-btn ${tool === t.id ? 'active' : ''}`}
              onClick={() => {
                setTool(t.id)
                setConnectFrom(null)
              }}
              title={t.title}
            >
              <div className={t.icon}>{t.id === 'text' ? 'T' : ''}</div>
            </button>
          ))}
        </div>

        <BoardCanvas
          content={content}
          selection={selection}
          tool={tool}
          viewport={viewport}
          editingId={editingId}
          connectFrom={connectFrom}
          onSelectionChange={setSelection}
          onCommit={handleCommit}
          onTransient={handleTransient}
          onGestureEnd={handleGestureEnd}
          onViewportChange={setViewport}
          onEditingChange={setEditingId}
          onConnectFromChange={setConnectFrom}
          onToolChange={(t) => setTool(t as Tool)}
        />

        <div className="canvas-zoom-pill">
          <button className="zoom-btn" onClick={() => zoomBy(1 / 1.2)}>−</button>
          <span className="zoom-value">{Math.round(viewport.zoom * 100)}%</span>
          <button className="zoom-btn" onClick={() => zoomBy(1.2)}>+</button>
          <div className="zoom-divider" />
          <button className="zoom-btn" onClick={zoomFit}>Fit</button>
        </div>
      </div>
    </div>
  )
}
