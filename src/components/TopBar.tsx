import { useState } from 'react'
import type { FileType } from '../lib/types'
import './TopBar.css'

interface TopBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onCreateBoard: (type: FileType) => void
}

export default function TopBar({
  searchQuery,
  onSearchChange,
  onCreateBoard,
}: TopBarProps) {
  const [createMenuOpen, setCreateMenuOpen] = useState(false)

  const getAvatarColor = (index: number) => {
    const colors = ['oklch(0.7 0.12 40)', 'oklch(0.7 0.12 280)', 'oklch(0.7 0.12 180)']
    return colors[index % colors.length]
  }

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
          <div className="avatar" style={{ backgroundColor: getAvatarColor(0) }}>MK</div>
          <div className="avatar" style={{ backgroundColor: getAvatarColor(1) }}>JT</div>
          <div className="avatar" style={{ backgroundColor: getAvatarColor(2) }}>AS</div>
        </div>

        <div className="top-bar-create">
          <button
            className="btn-primary"
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
          >
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
