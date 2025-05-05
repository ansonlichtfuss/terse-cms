import type React from "react"
// File-related types
export interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileNode[]
}

export interface FileData {
  path: string
  content: string
  isModified: boolean
}

// S3/Media-related types
export interface S3Item {
  key: string
  type: "file" | "folder"
  size?: number
  lastModified?: string
  url?: string
}

// Git-related types
export interface Commit {
  hash: string
  message: string
  author: string
  date: string
  changes: {
    files: string[]
    insertions: number
    deletions: number
  }
}

// Editor-related types
export interface EditorToolbarAction {
  icon: React.ReactNode
  action: string
  value?: string
  tooltip: string
  onClick?: () => void
}

export interface EditorToolbarGroup {
  group: string
  items: EditorToolbarAction[]
}

// Dynamic field types
export interface DynamicFieldProps {
  name: string
  value: any
  path?: string
  onChange: (path: string, value: any) => void
  onAddItem?: (path: string) => void
  onRemoveItem?: (path: string, index: number) => void
  level?: number
}

export interface ImageArrayFieldProps {
  name: string
  value: any[]
  path: string
  onChange: (path: string, value: any) => void
  onAddItem: (path: string) => void
  onRemoveItem: (path: string, index: number) => void
}
