import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import type { Workspace, Folder } from '../lib/types'
import './Sidebar.css'

interface SidebarProps {
  workspace: Workspace
  folders: Folder[]
  currentView?: 'recent' | 'favorites'
  currentProjectId?: string
  onCreateProject: () => void
  onRenameProject: (id: string, name: string) => void
  onDeleteProject: (id: string) => void
}

const FOLDER_COLORS = ['var(--teal)', 'var(--violet)', 'var(--amber)']

export default function Sidebar({
  workspace,
  folders,
  currentView,
  currentProjectId,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: SidebarProps) {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const getUserInitials = () => {
    const name = session?.user?.user_metadata?.display_name || session?.user?.email || ''
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = () => {
    const index = Math.abs(getUserInitials().charCodeAt(0)) % 3
    return ['oklch(0.7 0.12 40)', 'oklch(0.7 0.12 280)', 'oklch(0.7 0.12 180)'][index]
  }

  const navItems = [
    { label: 'All boards', id: 'all', icon: 'box' },
    { label: 'Recent', id: 'recent', icon: 'circle' },
    { label: 'Favorites', id: 'favorites', icon: 'star' },
  ]

  const isNavActive = (id: string) => {
    if (id === 'all') return !currentView && !currentProjectId
    if (id === 'recent') return currentView === 'recent'
    if (id === 'favorites') return currentView === 'favorites'
    return false
  }

  return (
    <div className="sidebar">
      {/* Workspace header */}
      <div className="sidebar-workspace">
        <div className="logo-mark" style={{ width: '26px', height: '26px' }} />
        <div className="workspace-name">{workspace.name}</div>
        <div className="workspace-dropdown">▾</div>
      </div>

      {/* Navigation items */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${isNavActive(item.id) ? 'active' : ''}`}
            onClick={() => {
              if (item.id === 'all') navigate('/home')
              else navigate(`/home/${item.id}`)
            }}
          >
            <span className={`nav-icon nav-icon-${item.icon}`} />
            {item.label}
          </button>
        ))}
        <button className="nav-item" onClick={() => alert('Coming soon!')}>
          <span className="nav-icon nav-icon-templates" />
          Templates
          <span className="coming-soon-tag">Coming soon</span>
        </button>
      </nav>

      {/* Projects section */}
      <div className="sidebar-projects">
        <div className="projects-label">PROJECTS</div>
        <div className="projects-list">
          {folders.map((folder, idx) => (
            <div
              key={folder.id}
              className={`project-item ${currentProjectId === folder.id ? 'active' : ''}`}
              onMouseEnter={() => setHoveredFolder(folder.id)}
              onMouseLeave={() => setHoveredFolder(null)}
            >
              <button
                className="project-button"
                onClick={() => navigate(`/project/${folder.id}`)}
              >
                <span
                  className="project-dot"
                  style={{ backgroundColor: FOLDER_COLORS[idx % FOLDER_COLORS.length] }}
                />
                {folder.name}
              </button>
              {hoveredFolder === folder.id && (
                <div className="project-menu">
                  <button onClick={() => onRenameProject(folder.id, folder.name)}>Rename</button>
                  <button onClick={() => onDeleteProject(folder.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="new-project-button" onClick={onCreateProject}>
          + New project
        </button>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div
            className="user-avatar"
            style={{ backgroundColor: getAvatarColor() }}
          >
            {getUserInitials()}
          </div>
          <div className="user-name">
            {session?.user?.user_metadata?.display_name || 'User'}
          </div>
        </div>
        <button className="sign-out-button" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}
