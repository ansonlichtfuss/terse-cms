"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Editor } from "@/components/editor"
import { Dashboard } from "@/components/dashboard"
import type { FileData } from "@/types"

export default function EditPage() {
  const params = useParams()
  const [file, setFile] = useState<FileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Extract the file path from the URL parameters
  const filePath = Array.isArray(params.path) ? params.path.join("/") : params.path || ""

  useEffect(() => {
    if (filePath) {
      fetchFile(filePath)
    } else {
      setIsLoading(false)
    }
  }, [filePath])

  const fetchFile = async (path: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`)
      const data = await response.json()

      setFile({
        path,
        content: data.content,
        isModified: false,
      })
    } catch (error) {
      console.error("Failed to fetch file:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSave = async (path: string, content: string) => {
    try {
      await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path, content }),
      })

      // Update file state
      if (file && file.path === path) {
        setFile({
          ...file,
          content,
          isModified: true,
        })
      }
    } catch (error) {
      console.error("Failed to save file:", error)
    }
  }

  return (
    <Dashboard selectedFilePath={filePath}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Loading file...</div>
      ) : file ? (
        <Editor file={file} onSave={handleFileSave} />
      ) : (
        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
          Select a file to edit
        </div>
      )}
    </Dashboard>
  )
}
