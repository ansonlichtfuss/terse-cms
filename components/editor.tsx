"use client"

import { useState, useEffect, useRef } from "react"
import { Clock } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import type { FileData } from "@/components/dashboard"
import { debounce } from "lodash"
import { MediaDialog } from "@/components/media-dialog"
import { EditorToolbar } from "@/components/editor-toolbar"
import { MetadataSidebar } from "@/components/metadata-sidebar"
import { getUserPreferences, saveUserPreferences } from "@/lib/user-preferences"

interface EditorProps {
  file: FileData
  onSave: (path: string, content: string) => void
}

export function Editor({ file, onSave }: EditorProps) {
  const [content, setContent] = useState("")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)

  // Reference to the textarea element
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Track cursor position for inserting at cursor
  const [cursorPosition, setCursorPosition] = useState<{ start: number; end: number }>({ start: 0, end: 0 })

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

  // Handle content changes from user input
  const handleContentChange = (newContent: string) => {
    setContent(newContent)

    // Save cursor position
    if (textareaRef.current) {
      setCursorPosition({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      })
    }

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
  const handleToolbarAction = (action: string, value?: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const startPos = textarea.selectionStart
    const endPos = textarea.selectionEnd
    const selectedText = content.substring(startPos, endPos)

    let newContent = content
    let newCursorPos = endPos

    switch (action) {
      case "heading":
        // Insert heading at the beginning of the line
        const lineStart = content.lastIndexOf("\n", startPos - 1) + 1
        newContent = content.substring(0, lineStart) + value + content.substring(lineStart)
        newCursorPos = lineStart + (value?.length || 0)
        break

      case "bold":
        newContent = content.substring(0, startPos) + `**${selectedText || "bold text"}**` + content.substring(endPos)
        newCursorPos = startPos + 2 + (selectedText ? selectedText.length : 9)
        break

      case "italic":
        newContent = content.substring(0, startPos) + `*${selectedText || "italic text"}*` + content.substring(endPos)
        newCursorPos = startPos + 1 + (selectedText ? selectedText.length : 11)
        break

      case "list":
        newContent = content.substring(0, startPos) + `- ${selectedText || "List item"}` + content.substring(endPos)
        newCursorPos = startPos + 2 + (selectedText ? selectedText.length : 9)
        break

      case "ordered-list":
        newContent = content.substring(0, startPos) + `1. ${selectedText || "List item"}` + content.substring(endPos)
        newCursorPos = startPos + 3 + (selectedText ? selectedText.length : 9)
        break

      case "link":
        newContent =
          content.substring(0, startPos) + `[${selectedText || "Link text"}](url)` + content.substring(endPos)
        newCursorPos = startPos + 1 + (selectedText ? selectedText.length : 9)
        break

      case "code":
        newContent =
          content.substring(0, startPos) + "```\n" + (selectedText || "code") + "\n```" + content.substring(endPos)
        newCursorPos = startPos + 4 + (selectedText ? selectedText.length : 4)
        break

      case "quote":
        // Insert quote at the beginning of the line
        const quoteLineStart = content.lastIndexOf("\n", startPos - 1) + 1
        newContent = content.substring(0, quoteLineStart) + "> " + content.substring(quoteLineStart)
        newCursorPos = quoteLineStart + 2
        break

      case "undo":
        textarea.focus()
        document.execCommand("undo")
        return

      case "redo":
        textarea.focus()
        document.execCommand("redo")
        return
    }

    setContent(newContent)

    // Set the new cursor position after state update
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)

    // Auto-save the updated content
    if (!initialLoadRef.current && file) {
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

  return (
    <div className="h-full flex">
      {/* Editor */}
      <div className="flex-1 flex flex-col relative">
        <div className="border-b p-2 flex items-center justify-between">
          <div className="flex-1 truncate">
            <h2 className="text-sm font-semibold truncate">{file.path.split("/").pop()}</h2>
            <p className="text-xs text-muted-foreground truncate">{file.path}</p>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {lastSaved ? `Auto-saved ${lastSaved.toLocaleTimeString()}` : "Auto-save enabled"}
          </div>
        </div>

        {/* Editor Toolbar */}
        <div className="px-2 pt-2">
          <EditorToolbar onAction={handleToolbarAction} onImageClick={() => setIsMediaDialogOpen(true)} />
        </div>

        {/* Markdown Editor */}
        <div className="flex-1 p-2 m-0">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full min-h-[calc(100vh-12rem)] font-mono resize-none p-2 text-xs"
            placeholder="# Start writing your markdown here..."
            onSelect={() => {
              if (textareaRef.current) {
                setCursorPosition({
                  start: textareaRef.current.selectionStart,
                  end: textareaRef.current.selectionEnd,
                })
              }
            }}
          />
        </div>
      </div>

      {/* Metadata Sidebar - now on the right side */}
      <MetadataSidebar content={content} isVisible={isSidebarVisible} onToggle={toggleSidebar} />

      {/* Media Dialog for Image Selection */}
      <MediaDialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen} onSelect={handleMediaSelect} />
    </div>
  )
}
