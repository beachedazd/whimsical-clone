import { useCallback, useRef, useState } from 'react'
import type { BoardContent } from '../../lib/types'

const MAX_HISTORY = 100

/**
 * Content + undo/redo. Two mutation paths:
 * - commit(next): atomic change — pushes the current content onto the undo stack.
 * - setContent(next): transient change (mid-drag) — no history entry.
 *   The gesture then ends with commitFrom(base, final) so one drag = one undo step.
 */
export function useHistory(initial: BoardContent) {
  const [content, setContent] = useState(initial)
  const undoStack = useRef<BoardContent[]>([])
  const redoStack = useRef<BoardContent[]>([])
  const contentRef = useRef(content)
  contentRef.current = content

  const push = (base: BoardContent) => {
    undoStack.current.push(base)
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift()
    redoStack.current = []
  }

  const commit = useCallback((next: BoardContent) => {
    push(contentRef.current)
    setContent(next)
  }, [])

  const commitFrom = useCallback((base: BoardContent, next: BoardContent) => {
    push(base)
    setContent(next)
  }, [])

  const undo = useCallback(() => {
    const prev = undoStack.current.pop()
    if (!prev) return false
    redoStack.current.push(contentRef.current)
    setContent(prev)
    return true
  }, [])

  const redo = useCallback(() => {
    const next = redoStack.current.pop()
    if (!next) return false
    undoStack.current.push(contentRef.current)
    setContent(next)
    return true
  }, [])

  /** Replace content without touching history (initial load). */
  const reset = useCallback((next: BoardContent) => {
    undoStack.current = []
    redoStack.current = []
    setContent(next)
  }, [])

  return { content, contentRef, setContent, commit, commitFrom, undo, redo, reset }
}
