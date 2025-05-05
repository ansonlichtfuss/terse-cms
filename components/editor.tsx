"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, Edit2 } from "lucide-react"
import type { FileData } from "@/types"
import { debounce } from "lodash"
import { MediaDialog } from "@/components/media-dialog"
import { EditorToolbar } from "@/components/editor-toolbar"
import { UnifiedSidebar } from "@/components/unified-sidebar"
import { getUserPreferences, saveUserPreferences } from "@/lib/user-preferences"
import { EditorContent, handleToolbarAction, type CursorPosition } from "@/components/editor-content"
import matter from "gray-matter"
import { RenameFileDialog } from "@/components/rename-file-dialog"

interface EditorProps {
  file: FileData
  onSave: (path: string, content: string) => void
}

export function Editor({ file, onSave }: EditorProps) {
  const [content, setContent] = useState("")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [fileTitle, setFileTitle] = useState("")
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)

  // Reference to the textarea element
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Track cursor position for inserting at cursor
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ start: 0, end: 0 })

  // Use refs to track the previous file and whether we're currently saving
  const prevFileRef = useRef<FileData | null>(null)
  const isSavingRef = useRef(false)
  const initialLoadRef = useRef(true)

  // Create a stable debounced save function
  const debouncedSaveRef = useRef<any>(null)
  if (!debouncedSaveRef.current) {
    debouncedSaveRef.current = debounce((path: string, content: string) => {
      isSavingRef.current = true
      onSave(path, content)
      setLastSaved(new Date())
      setTimeout(() => {
        isSavingRef.current = false
      }, 100)
    }, 1000)
  }

  // Load user preferences on mount
  useEffect(() => {
    const preferences = getUserPreferences()
    setIsSidebarVisible(preferences.isSidebarVisible)
  }, [])

  // Save sidebar visibility preference when it changes
  useEffect(() => {
    if (!initialLoadRef.current) {
      saveUserPreferences({ isSidebarVisible })
    }
  }, [isSidebarVisible])

  // Update local state when file prop changes, but only if it's actually different
  useEffect(() => {
    // Skip if we're currently in the process of saving
    if (isSavingRef.current) return

    // Skip if the file hasn't changed
    if (
      prevFileRef.current &&
      file &&
      prevFileRef.current.path === file.path &&
      prevFileRef.current.content === file.content
    ) {
      return
    }

    // Update the content state
    if (file) {
      setContent(file.content || "")
      prevFileRef.current = file
    }

    // After initial load, we can start auto-saving
    if (initialLoadRef.current) {
      initialLoadRef.current = false
    }
  }, [file])

  // Add this effect to parse the front matter and extract the title
  useEffect(() => {
    if (file && file.content) {
      try {
        const { data } = matter(file.content || "")
        setFileTitle(data.title || "")
      } catch (error) {
        console.error("Error parsing front matter:", error)
        setFileTitle("")
      }
    }
  }, [file])

  // Handle content changes from user input
  const handleContentChange = (newContent: string) => {
    setContent(newContent)

    // Only auto-save if we're past the initial load
    if (!initialLoadRef.current && file) {
      debouncedSaveRef.current(file.path, newContent)
    }
  }

  // Handle media selection
  const handleMediaSelect = (url: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const startPos = textarea.selectionStart
    const endPos = textarea.selectionEnd

    // Insert markdown image syntax at cursor position
    const imageMarkdown = `![Alt text](${url})`
    const newContent = content.substring(0, startPos) + imageMarkdown + content.substring(endPos)

    setContent(newContent)

    // Update cursor position to after the inserted image
    const newCursorPos = startPos + imageMarkdown.length

    // Set the new cursor position after state update
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)

    // Auto-save the updated content
    if (!initialLoadRef.current && file) {
      debouncedSaveRef.current(file.path, newContent)
    }

    setIsMediaDialogOpen(false)
  }

  // Handle toolbar actions
  const handleToolbarActionClick = (action: string, value?: string) => {
    if (!textareaRef.current) return

    const newContent = handleToolbarAction(action, value, textareaRef, content, cursorPosition, handleContentChange)

    // Auto-save the updated content
    if (!initialLoadRef.current && file && newContent !== content) {
      debouncedSaveRef.current(file.path, newContent)
    }
  }

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  // Clean up the debounced function on unmount
  useEffect(() => {
    return () => {
      if (debouncedSaveRef.current) {
        debouncedSaveRef.current.cancel()
      }
    }
  }, [])

  // Handle file rename
  const handleRename = async (newName: string) => {
    if (!file) return

    try {
      const response = await fetch("/api/files/operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "rename",
          sourcePath: file.path,
          newName,
          type: "file",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to rename file")
      }

      // Get the directory path
      const dirPath = file.path.split("/").slice(0, -1).join("/")
      const newPath = dirPath ? `${dirPath}/${newName}` : newName

      // Update the file path
      if (onSave) {
        onSave(newPath, file.content)
      }

      setIsRenameDialogOpen(false)
    } catch (error) {
      console.error("Failed to rename file:", error)
    }
  }

  // Safely get the filename from the path
  const getFileName = () => {
    if (!file || !file.path) return "Untitled"
    const pathParts = file.path.split("/")
    return pathParts[pathParts.length - 1] || "Untitled"
  }

  return (
    <div className="h-full flex">
      {/* Editor */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="border-b p-2 flex items-center justify-between bg-gradient-secondary">
          <div className="flex-1 truncate">
            <h2
              className="text-sm font-semibold truncate flex items-center cursor-pointer hover:text-primary"
              onClick={() => setIsRenameDialogOpen(true)}
            >
              {getFileName()} <Edit2 className="h-3 w-3 ml-1 opacity-50" />
            </h2>
            {fileTitle && <p className="text-xs text-muted-foreground truncate">{fileTitle}</p>}
          </div>
          {/* Autosave notice as a link instead of a button */}
          <span
            className="autosave-link"
            onClick={() => {
              // Toggle to history tab in sidebar
              setIsSidebarVisible(true)
              // Add this line to notify the UnifiedSidebar to switch to history tab
              if (window) window.dispatchEvent(new CustomEvent("switch-to-history-tab"))
            }}
          >
            <Clock className="h-3 w-3 mr-1" />
            {lastSaved ? `Auto-saved ${lastSaved.toLocaleTimeString()}` : "Auto-save enabled"}
          </span>
        </div>

        {/* Editor Toolbar */}
        <div className="px-2 pt-2">
          <EditorToolbar onAction={handleToolbarActionClick} onImageClick={() => setIsMediaDialogOpen(true)} />
        </div>

        {/* Markdown Editor */}
        <div className="flex-1 p-2 m-0">
          <EditorContent content={content} onChange={handleContentChange} />
        </div>
      </div>

      {/* Unified Sidebar - now with tabs for metadata and history */}
      <UnifiedSidebar
        content={content}
        filePath={file?.path || ""}
        isVisible={isSidebarVisible}
        onToggle={toggleSidebar}
        lastSaved={lastSaved}
      />

      {/* Media Dialog for Image Selection */}
      <MediaDialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen} onSelect={handleMediaSelect} />

      {/* Rename File Dialog */}
      {file && (
        <RenameFileDialog
          open={isRenameDialogOpen}
          onOpenChange={setIsRenameDialogOpen}
          item={{
            key: file.path,
            type: "file",
          }}
          onRename={handleRename}
          isMarkdownFile={true}
        />
      )}
    </div>
  )
}
