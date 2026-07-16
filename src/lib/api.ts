import { supabase } from './supabase'
import type { FileRow, FileType, Folder, Workspace } from './types'
import { emptyContent } from './types'

// --- Workspace ---
export async function getMyWorkspace(): Promise<Workspace> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at')
    .limit(1)
    .single()
  if (error) throw error
  return data as Workspace
}

// --- Files ---
export async function listFiles(workspaceId: string): Promise<FileRow[]> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as FileRow[]
}

export async function getFile(id: string): Promise<FileRow> {
  const { data, error } = await supabase.from('files').select('*').eq('id', id).single()
  if (error) throw error
  return data as FileRow
}

export async function createFile(
  workspaceId: string,
  type: FileType,
  folderId: string | null = null,
): Promise<FileRow> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw userError ?? new Error('Not signed in')
  const titles: Record<FileType, string> = {
    flowchart: 'Untitled flowchart',
    wireframe: 'Untitled wireframe',
    sticky: 'Untitled sticky board',
    doc: 'Untitled doc',
  }
  const { data, error } = await supabase
    .from('files')
    .insert({
      workspace_id: workspaceId,
      folder_id: folderId,
      type,
      title: titles[type],
      content: emptyContent(type),
      created_by: userData.user.id,
    })
    .select()
    .single()
  if (error) throw error
  return data as FileRow
}

export async function updateFileContent(id: string, content: FileRow['content']): Promise<void> {
  const { error } = await supabase.from('files').update({ content }).eq('id', id)
  if (error) throw error
}

export async function renameFile(id: string, title: string): Promise<void> {
  const { error } = await supabase.from('files').update({ title }).eq('id', id)
  if (error) throw error
}

export async function moveFile(id: string, folderId: string | null): Promise<void> {
  const { error } = await supabase.from('files').update({ folder_id: folderId }).eq('id', id)
  if (error) throw error
}

export async function deleteFile(id: string): Promise<void> {
  const { error } = await supabase.from('files').delete().eq('id', id)
  if (error) throw error
}

export async function duplicateFile(id: string): Promise<FileRow> {
  const original = await getFile(id)
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('files')
    .insert({
      workspace_id: original.workspace_id,
      folder_id: original.folder_id,
      type: original.type,
      title: `${original.title} (copy)`,
      content: original.content,
      created_by: userData.user!.id,
    })
    .select()
    .single()
  if (error) throw error
  return data as FileRow
}

// --- Folders ---
export async function listFolders(workspaceId: string): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name')
  if (error) throw error
  return (data ?? []) as Folder[]
}

export async function createFolder(workspaceId: string, name: string): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .insert({ workspace_id: workspaceId, name })
    .select()
    .single()
  if (error) throw error
  return data as Folder
}

export async function renameFolder(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('folders').update({ name }).eq('id', id)
  if (error) throw error
}

export async function deleteFolder(id: string): Promise<void> {
  const { error } = await supabase.from('folders').delete().eq('id', id)
  if (error) throw error
}

// --- Favorites ---
export async function listFavoriteIds(): Promise<Set<string>> {
  const { data, error } = await supabase.from('favorites').select('file_id')
  if (error) throw error
  return new Set((data ?? []).map((r: any) => r.file_id as string))
}

export async function toggleFavorite(fileId: string, isFavorite: boolean): Promise<void> {
  if (isFavorite) {
    const { error } = await supabase.from('favorites').delete().eq('file_id', fileId)
    if (error) throw error
  } else {
    const { data: userData } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('favorites')
      .insert({ file_id: fileId, user_id: userData.user!.id })
    if (error) throw error
  }
}
