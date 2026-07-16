import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getFile, updateFileContent, renameFile } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { FileRow } from '../lib/types'
import './doc.css'

interface Heading {
  id: string
  text: string
  level: 1 | 2
  element: HTMLElement
}

export default function DocEditor() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const [file, setFile] = useState<FileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [saveTime, setSaveTime] = useState<Date | null>(null)

  // Toolbar state
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 })
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    h1: false,
    h2: false,
    ul: false,
    blockquote: false,
    code: false,
  })

  // Outline state
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)

  const editorRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const headingIdMapRef = useRef<Map<HTMLElement, string>>(new Map())
  const initializeRef = useRef(false)

  // Load file
  useEffect(() => {
    if (!id) return
    setLoading(true)
    getFile(id)
      .then((data) => {
        setFile(data)
        initializeRef.current = false
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  // Initialize editor with HTML (only once)
  useEffect(() => {
    if (!file || !editorRef.current || initializeRef.current) return
    initializeRef.current = true

    // Set initial HTML
    const html = (file.content as { html: string }).html || ''
    editorRef.current.innerHTML = html

    // Set title
    if (titleInputRef.current) {
      titleInputRef.current.value = file.title
    }

    // Scan headings after content is loaded
    setTimeout(() => scanHeadings(), 0)
  }, [file?.id])

  // Autosave on dirty
  useEffect(() => {
    if (!dirty || !id) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    setSaveStatus('saving')

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const html = editorRef.current?.innerHTML || ''
        await updateFileContent(id, { html })
        setSaveStatus('saved')
        setSaveTime(new Date())
        setDirty(false)
      } catch (err) {
        console.error('Save error:', err)
        setSaveStatus('unsaved')
      }
    }, 800)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [dirty, id])

  // Flush autosave on unmount
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [dirty])

  // Scan headings from editor
  const scanHeadings = useCallback(() => {
    if (!editorRef.current) return

    const headingIdMap = new Map<HTMLElement, string>()
    const newHeadings: Heading[] = []
    let idCounter = 0

    editorRef.current.querySelectorAll('h1, h2').forEach((el) => {
      const htmlEl = el as HTMLElement
      const id = `h${idCounter++}`
      const level = el.tagName === 'H1' ? (1 as const) : (2 as const)
      const text = el.textContent || ''

      headingIdMap.set(htmlEl, id)
      newHeadings.push({ id, text, level, element: htmlEl })
    })

    headingIdMapRef.current = headingIdMap
    setHeadings(newHeadings)
  }, [])

  // Update toolbar visibility and active formats
  const updateToolbar = useCallback(() => {
    const selection = window.getSelection()

    if (!selection || selection.toString().length === 0) {
      setToolbarVisible(false)
      return
    }

    try {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      // Position toolbar above selection
      setToolbarPos({
        top: rect.top + window.scrollY - 48,
        left: rect.left + window.scrollX + rect.width / 2 - 50, // center approximately
      })
      setToolbarVisible(true)

      // Check active formats
      const parentElement = selection.focusNode?.parentElement as HTMLElement | null

      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        h1: parentElement?.tagName === 'H1' || false,
        h2: parentElement?.tagName === 'H2' || false,
        ul: document.queryCommandState('insertUnorderedList'),
        blockquote: parentElement?.tagName === 'BLOCKQUOTE' || false,
        code: parentElement?.tagName === 'PRE' || false,
      })
    } catch (err) {
      setToolbarVisible(false)
    }
  }, [])

  // Update outline highlight based on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (headings.length === 0) return

      let nearestHeadingId: string | null = null
      let nearestDistance = Infinity

      headings.forEach((h) => {
        const rect = h.element.getBoundingClientRect()
        if (rect.top >= 0 && rect.top < window.innerHeight) {
          if (rect.top < nearestDistance) {
            nearestDistance = rect.top
            nearestHeadingId = h.id
          }
        }
      })

      setActiveHeadingId(nearestHeadingId)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings])

  // Handle editor input
  const handleEditorInput = useCallback(() => {
    setDirty(true)
    setSaveStatus('unsaved')
    scanHeadings()
  }, [scanHeadings])

  // Handle editor selection
  const handleEditorMouseUp = useCallback(() => {
    updateToolbar()
  }, [updateToolbar])

  const handleEditorKeyUp = useCallback(() => {
    updateToolbar()
  }, [updateToolbar])

  // Format commands
  const applyFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    updateToolbar()
  }, [updateToolbar])

  // Toolbar button handlers
  const handleBold = useCallback(() => applyFormat('bold'), [applyFormat])
  const handleItalic = useCallback(() => applyFormat('italic'), [applyFormat])
  const handleH1 = useCallback(() => {
    applyFormat('formatBlock', activeFormats.h1 ? 'p' : 'h1')
  }, [applyFormat, activeFormats.h1])
  const handleH2 = useCallback(() => {
    applyFormat('formatBlock', activeFormats.h2 ? 'p' : 'h2')
  }, [applyFormat, activeFormats.h2])
  const handleUL = useCallback(() => applyFormat('insertUnorderedList'), [applyFormat])
  const handleBlockquote = useCallback(() => {
    applyFormat('formatBlock', activeFormats.blockquote ? 'p' : 'blockquote')
  }, [applyFormat, activeFormats.blockquote])
  const handleCode = useCallback(() => {
    applyFormat('formatBlock', activeFormats.code ? 'p' : 'pre')
  }, [applyFormat, activeFormats.code])

  // Title handling
  const handleTitleBlur = useCallback(async () => {
    const newTitle = titleInputRef.current?.value?.trim() || 'Untitled doc'
    if (file && newTitle !== file.title) {
      try {
        await renameFile(id!, newTitle)
        setFile({ ...file, title: newTitle })
      } catch (err) {
        console.error('Rename error:', err)
        if (titleInputRef.current) titleInputRef.current.value = file.title
      }
    }
  }, [file, id])

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleTitleBlur()
        e.currentTarget.blur()
      }
    },
    [handleTitleBlur]
  )

  // Share button
  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      // Could add a toast notification here
    } catch (err) {
      console.error('Copy error:', err)
    }
  }, [])

  // User info
  const displayName = session?.user?.user_metadata?.display_name || session?.user?.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Relative time formatter
  const getRelativeTime = (date: Date | null): string => {
    if (!date) return 'just now'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return 'earlier'
  }

  if (loading) return <div className="app-loading">Loading…</div>
  if (!file) return <div className="app-loading">Not found</div>

  const saveStatusText =
    saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'saved'
        ? `Saved · ${getRelativeTime(saveTime)}`
        : 'Unsaved changes'

  return (
    <div className="doc-editor">
      {/* Top bar */}
      <div className="doc-topbar">
        <Link to="/home" className="logo-mark" style={{ width: 24, height: 24 }} />
        <span className="doc-breadcrumb">Docs /</span>
        <span className="doc-title-bar">{file.title}</span>
        <div className="doc-topbar-right">
          <span className="doc-save-status">{saveStatusText}</span>
          <button className="btn-primary" onClick={handleShare}>
            Share
          </button>
        </div>
      </div>

      {/* Main body */}
      <div className="doc-body">
        {/* Floating toolbar */}
        {toolbarVisible && (
          <div ref={toolbarRef} className="doc-toolbar" style={{ top: `${toolbarPos.top}px`, left: `${toolbarPos.left}px` }}>
            <button
              className={`doc-toolbar-btn ${activeFormats.bold ? 'active' : ''}`}
              onClick={handleBold}
              onMouseDown={(e) => e.preventDefault()}
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              className={`doc-toolbar-btn ${activeFormats.italic ? 'active' : ''}`}
              onClick={handleItalic}
              onMouseDown={(e) => e.preventDefault()}
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              className={`doc-toolbar-btn ${activeFormats.h1 ? 'active' : ''}`}
              onClick={handleH1}
              onMouseDown={(e) => e.preventDefault()}
              title="Heading 1"
            >
              H1
            </button>
            <button
              className={`doc-toolbar-btn ${activeFormats.h2 ? 'active' : ''}`}
              onClick={handleH2}
              onMouseDown={(e) => e.preventDefault()}
              title="Heading 2"
            >
              H2
            </button>
            <button
              className={`doc-toolbar-btn ${activeFormats.ul ? 'active' : ''}`}
              onClick={handleUL}
              onMouseDown={(e) => e.preventDefault()}
              title="Bullet list"
            >
              •
            </button>
            <button
              className={`doc-toolbar-btn ${activeFormats.blockquote ? 'active' : ''}`}
              onClick={handleBlockquote}
              onMouseDown={(e) => e.preventDefault()}
              title="Blockquote"
            >
              "
            </button>
            <button
              className={`doc-toolbar-btn ${activeFormats.code ? 'active' : ''}`}
              onClick={handleCode}
              onMouseDown={(e) => e.preventDefault()}
              title="Code block"
            >
              &lt;&gt;
            </button>
          </div>
        )}

        {/* Left outline */}
        {headings.length > 0 && (
          <div className="doc-outline">
            {headings.map((h) => (
              <button
                key={h.id}
                className={`doc-outline-item ${h.level === 2 ? 'level-2' : ''} ${activeHeadingId === h.id ? 'active' : ''}`}
                onClick={() => {
                  h.element.scrollIntoView({ behavior: 'smooth' })
                  editorRef.current?.focus()
                }}
              >
                {h.text || '(empty heading)'}
              </button>
            ))}
          </div>
        )}

        {/* Main column */}
        <div className="doc-column">
          <input
            ref={titleInputRef}
            type="text"
            className="doc-title-input"
            placeholder="Untitled doc"
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
          />

          <div className="doc-byline">
            <div className="doc-avatar">{initials}</div>
            <span className="doc-byline-text">
              {displayName} · Last edited {getRelativeTime(saveTime)}
            </span>
          </div>

          <div
            ref={editorRef}
            className="doc-editor-area"
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onMouseUp={handleEditorMouseUp}
            onKeyUp={handleEditorKeyUp}
          />
        </div>
      </div>
    </div>
  )
}
