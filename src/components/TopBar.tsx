import { useEffect, useRef, useState } from 'react'
import type { FileType } from '../lib/types'
import { useAuth } from '../lib/auth'
import './TopBar.css'

interface TopBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onCreateBoard: (type: FileType) => void
}

export default function TopBar({ searchQuery, onSearchChange, onCreateBoard }: TopBarProps) {
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { session } = useAuth()

  const name =
    (session?.user.user_metadata?.display_name as string | undefined) ??
    session?.user.email ??
    '?'
  const initials = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')

  useEffect(() => {
    if (!createMenuOpen) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false)
      }
    }
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setCreateMenuOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onEsc)
    }
  }, [createMenuOpen])

  const handleCreateBoard = (type: FileType) => {
    onCreateBoard(type)
    setCreateMenuOpen(false)
  }

  return (
    <div className="top-bar">
      <div className="top-bar-search-container">
        <input
          type="text"
          className="top-bar-search"
          placeholder="Search boards, docs, people…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="search-icon">⊙</span>
      </div>

      <div className="top-bar-right">
        <div className="top-bar-avatars">
          <div className="avatar" style={{ backgroundColor: 'oklch(0.7 0.12 180)' }} title={name}>
            {initials}
          </div>
        </div>

        <div className="top-bar-create" ref={menuRef}>
          <button className="btn-primary" onClick={() => setCreateMenuOpen(!createMenuOpen)}>
            + New board
          </button>
          {createMenuOpen && (
            <div className="create-menu">
              <button onClick={() => handleCreateBoard('flowchart')}>Flowchart</button>
              <button onClick={() => handleCreateBoard('wireframe')}>Wireframe</button>
              <button onClick={() => handleCreateBoard('sticky')}>Sticky board</button>
              <button onClick={() => handleCreateBoard('doc')}>Doc</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
