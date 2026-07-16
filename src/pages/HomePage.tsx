import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import type { FileRow, Folder, Workspace } from '../lib/types'
import {
  getMyWorkspace,
  listFiles,
  listFolders,
  listFavoriteIds,
  createFile,
  createFileFromTemplate,
  createFolder,
  renameFolder,
  deleteFolder,
} from '../lib/api'
import { TEMPLATES, TEMPLATE_SECTIONS, type Template } from '../lib/templates'
import FileCard from '../components/FileCard'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import TemplatePreview from '../components/TemplatePreview'
import '../pages/home.css'

export default function HomePage() {
  const { view, projectId } = useParams<{ view?: string; projectId?: string }>()
  const navigate = useNavigate()
  const { session } = useAuth()

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [files, setFiles] = useState<FileRow[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentProjectName, setCurrentProjectName] = useState<string | null>(null)

  // Load data
  const loadData = async () => {
    if (!session?.user) return
    try {
      const [ws, fls, fldrs, favs] = await Promise.all([
        getMyWorkspace(),
        listFiles((await getMyWorkspace()).id).catch(() => []),
        listFolders((await getMyWorkspace()).id).catch(() => []),
        listFavoriteIds().catch(() => new Set<string>()),
      ])
      setWorkspace(ws)
      setFiles(fls)
      setFolders(fldrs)
      setFavoriteIds(favs as Set<string>)

      // Set current project name if viewing a project
      if (projectId) {
        const proj = fldrs.find((f) => f.id === projectId)
        setCurrentProjectName(proj?.name || null)
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [session])

  // Determine which files to display and header text
  const displayedFiles = useMemo(() => {
    let result = files

    // Filter by view/project
    if (projectId) {
      result = result.filter((f) => f.folder_id === projectId)
    } else if (view === 'favorites') {
      result = result.filter((f) => favoriteIds.has(f.id))
    } else if (view === 'recent') {
      result = result.slice(0, 8)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((f) => f.title.toLowerCase().includes(q))
    }

    return result
  }, [files, view, projectId, favoriteIds, searchQuery])

  const displayedTemplates = useMemo(() => {
    if (!searchQuery.trim()) return TEMPLATES
    const q = searchQuery.toLowerCase()
    return TEMPLATES.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    )
  }, [searchQuery])

  const getHeaderText = (): [string, string] => {
    if (view === 'templates') {
      return ['Templates', `${displayedTemplates.length} ready-made starting points`]
    }
    if (projectId && currentProjectName) {
      return [currentProjectName, `${displayedFiles.length} board${displayedFiles.length !== 1 ? 's' : ''} · sorted by last edited`]
    }
    if (view === 'recent') {
      return ['Recent', `${displayedFiles.length} board${displayedFiles.length !== 1 ? 's' : ''} · sorted by last edited`]
    }
    if (view === 'favorites') {
      return ['Favorites', `${displayedFiles.length} board${displayedFiles.length !== 1 ? 's' : ''} · sorted by last edited`]
    }
    return ['All boards', `${displayedFiles.length} board${displayedFiles.length !== 1 ? 's' : ''} · sorted by last edited`]
  }

  const handleCreateFile = async (type: 'flowchart' | 'wireframe' | 'sticky' | 'doc') => {
    if (!workspace) return
    try {
      const file = await createFile(workspace.id, type, projectId || null)
      navigate(`${type === 'doc' ? '/doc/' : '/board/'}${file.id}`)
    } catch (err) {
      console.error('Failed to create file:', err)
    }
  }

  const handleUseTemplate = async (template: Template) => {
    if (!workspace) return
    try {
      const file = await createFileFromTemplate(workspace.id, template)
      navigate(`${template.type === 'doc' ? '/doc/' : '/board/'}${file.id}`)
    } catch (err) {
      console.error('Failed to create file from template:', err)
    }
  }

  const handleCreateProject = async () => {
    if (!workspace) return
    const name = window.prompt('Project name:')
    if (!name) return
    try {
      await createFolder(workspace.id, name)
      await loadData()
    } catch (err) {
      console.error('Failed to create project:', err)
    }
  }

  const handleRenameProject = async (folderId: string, currentName: string) => {
    const newName = window.prompt('Rename project:', currentName)
    if (!newName || newName === currentName) return
    try {
      await renameFolder(folderId, newName)
      await loadData()
    } catch (err) {
      console.error('Failed to rename project:', err)
    }
  }

  const handleDeleteProject = async (folderId: string) => {
    if (!confirm('Delete this project? (Files will remain in the workspace)')) return
    try {
      await deleteFolder(folderId)
      await loadData()
      if (projectId === folderId) {
        navigate('/home')
      }
    } catch (err) {
      console.error('Failed to delete project:', err)
    }
  }

  const [headerTitle, headerSubtitle] = getHeaderText()

  if (loading) return <div className="app-loading">Loading…</div>
  if (!workspace) return <div className="app-loading">Error loading workspace</div>

  return (
    <div className="home-page">
      <Sidebar
        workspace={workspace}
        folders={folders}
        currentView={view as any}
        currentProjectId={projectId}
        onCreateProject={handleCreateProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
      />
      <div className="home-main">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateBoard={handleCreateFile}
        />
        <div className="home-content">
          <div className="home-header">
            <div>
              <h1 className="home-title">{headerTitle}</h1>
              <p className="home-subtitle">{headerSubtitle}</p>
            </div>
          </div>
          {view === 'templates' ? (
            displayedTemplates.length === 0 ? (
              <div className="empty-state">
                <p>No templates match "{searchQuery}"</p>
              </div>
            ) : (
              TEMPLATE_SECTIONS.map(({ type, title }) => {
                const sectionTemplates = displayedTemplates.filter((t) => t.type === type)
                if (sectionTemplates.length === 0) return null
                return (
                  <section key={type} className="templates-section">
                    <h2 className="templates-section-title">{title}</h2>
                    <div className="templates-grid">
                      {sectionTemplates.map((t) => (
                        <button
                          key={t.id}
                          className="template-card"
                          onClick={() => handleUseTemplate(t)}
                          title={`Create a ${title.toLowerCase().replace(/s$/, '')} from this template`}
                        >
                          <TemplatePreview template={t} />
                          <div className="template-info">
                            <div className="template-name">{t.name}</div>
                            <div className="template-desc">{t.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )
              })
            )
          ) : displayedFiles.length === 0 && !searchQuery ? (
            <div className="empty-state">
              <p>No boards yet. Create your first board to get started!</p>
              <button className="btn-primary" onClick={() => handleCreateFile('flowchart')}>
                Create your first board
              </button>
            </div>
          ) : displayedFiles.length === 0 ? (
            <div className="empty-state">
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="files-grid">
              {displayedFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  isFavorite={favoriteIds.has(file.id)}
                  folders={folders}
                  onRefresh={loadData}
                />
              ))}
              <button
                className="new-board-tile"
                onClick={() => {
                  const type = window.confirm('Flowchart? (OK=Flowchart, Cancel=Sticky)') ? 'flowchart' : 'sticky'
                  handleCreateFile(type)
                }}
              >
                <div className="new-board-plus">+</div>
                <div className="new-board-text">New board</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
