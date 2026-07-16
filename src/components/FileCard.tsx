import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FileRow, Folder } from '../lib/types'
import { FILE_TYPE_LABELS } from '../lib/types'
import {
  renameFile,
  duplicateFile,
  deleteFile,
  moveFile,
  toggleFavorite,
} from '../lib/api'
import './FileCard.css'

interface FileCardProps {
  file: FileRow
  isFavorite: boolean
  folders: Folder[]
  onRefresh: () => void
}

function getRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks === 1) return '1w ago'
  return `${diffWeeks}w ago`
}

export default function FileCard({
  file,
  isFavorite,
  folders,
  onRefresh,
}: FileCardProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleRename = async () => {
    const newTitle = window.prompt('Rename file:', file.title)
    if (newTitle && newTitle !== file.title) {
      try {
        await renameFile(file.id, newTitle)
        onRefresh()
      } catch (err) {
        console.error('Failed to rename:', err)
      }
    }
    setMenuOpen(false)
  }

  const handleDuplicate = async () => {
    try {
      await duplicateFile(file.id)
      onRefresh()
    } catch (err) {
      console.error('Failed to duplicate:', err)
    }
    setMenuOpen(false)
  }

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(file.id, isFavorite)
      onRefresh()
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
    setMenuOpen(false)
  }

  const handleMove = async (folderId: string | null) => {
    try {
      await moveFile(file.id, folderId)
      onRefresh()
    } catch (err) {
      console.error('Failed to move:', err)
    }
    setMenuOpen(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this file?')) return
    try {
      await deleteFile(file.id)
      onRefresh()
    } catch (err) {
      console.error('Failed to delete:', err)
    }
    setMenuOpen(false)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.file-card-menu')) return
    const editor = file.type === 'doc' ? '/doc/' : '/board/'
    navigate(`${editor}${file.id}`)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuOpen(true)
  }

  const relTime = getRelativeTime(file.updated_at)

  return (
    <div className="file-card" onClick={handleCardClick} onContextMenu={handleContextMenu}>
      {/* Thumbnail by type */}
      <div className={`file-thumbnail file-thumbnail-${file.type}`}>
        {file.type === 'flowchart' && (
          <>
            <div className="flowchart-box" style={{ left: '24px', top: '26px' }} />
            <div className="flowchart-box" style={{ left: '118px', top: '26px' }} />
            <div className="flowchart-line" />
            <div className="flowchart-box" style={{ left: '70px', top: '76px' }} />
          </>
        )}
        {file.type === 'wireframe' && (
          <>
            <div className="wireframe-frame" style={{ left: '28px', top: '20px' }} />
            <div className="wireframe-bar" style={{ left: '36px', top: '30px' }} />
            <div className="wireframe-bar" style={{ left: '36px', top: '44px' }} />
            <div className="wireframe-frame" style={{ left: '118px', top: '20px' }} />
            <div className="wireframe-bar" style={{ left: '126px', top: '30px' }} />
          </>
        )}
        {file.type === 'sticky' && (
          <>
            <div className="sticky-square" style={{ backgroundColor: 'var(--sticky-yellow)', left: '24px', top: '22px', transform: 'rotate(-4deg)' }} />
            <div className="sticky-square" style={{ backgroundColor: 'var(--sticky-pink)', left: '90px', top: '30px', transform: 'rotate(3deg)' }} />
            <div className="sticky-square" style={{ backgroundColor: 'var(--sticky-green)', left: '156px', top: '20px', transform: 'rotate(-2deg)' }} />
          </>
        )}
        {file.type === 'doc' && (
          <>
            <div className="doc-title" />
            <div className="doc-line" style={{ top: '30px' }} />
            <div className="doc-line" style={{ top: '44px' }} />
            <div className="doc-line" style={{ top: '58px', width: '60%' }} />
          </>
        )}
      </div>

      {/* Info */}
      <div className="file-info">
        <div className="file-title">{file.title}</div>
        <div className="file-meta">
          {FILE_TYPE_LABELS[file.type]} · edited {relTime}
        </div>
      </div>

      {/* Favorite badge */}
      {isFavorite && <div className="file-favorite-badge">★</div>}

      {/* Context menu button */}
      <button className="file-menu-button" onClick={(e) => {
        e.stopPropagation()
        setMenuOpen(!menuOpen)
      }}>
        ⋯
      </button>

      {/* Context menu */}
      {menuOpen && (
        <div className="file-card-menu" ref={menuRef}>
          <button onClick={handleRename}>Rename</button>
          <button onClick={handleDuplicate}>Duplicate</button>
          <button onClick={handleToggleFavorite}>
            {isFavorite ? 'Unfavorite' : 'Favorite'}
          </button>
          <div className="menu-submenu">
            <button className="menu-submenu-toggle">Move to project →</button>
            <div className="menu-submenu-content">
              <button onClick={() => handleMove(null)}>No project</button>
              {folders.map((folder) => (
                <button key={folder.id} onClick={() => handleMove(folder.id)}>
                  {folder.name}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleDelete} className="menu-delete">Delete</button>
        </div>
      )}
    </div>
  )
}
