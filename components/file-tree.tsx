"use client"

import { useState, useEffect } from "react"
import { Folder, File, ChevronRight, ChevronDown, MoreHorizontal, Edit, Trash2, MoveIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { MoveFileDialog } from "@/components/move-file-dialog"
import { RenameFileDialog } from "@/components/rename-file-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileNode[]
}

interface FileTreeProps {
  onFileSelect: (path: string) => void
}

export function FileTree({ onFileSelect }: FileTreeProps) {
  const [files, setFiles] = useState<FileNode[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToAction, setItemToAction] = useState<FileNode | null>(null)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("/api/files/tree")
        const data = await response.json()
        setFiles(data.files || [])
      } catch (error) {
        console.error("Failed to fetch file tree:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [])

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const handleFileClick = (path: string) => {
    setSelectedFile(path)
    onFileSelect(path)
  }

  const handleDelete = async () => {
    if (!itemToAction) return

    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: itemToAction.path }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete file")
      }

      // Refresh the file tree
      const treeResponse = await fetch("/api/files/tree")
      const data = await treeResponse.json()
      setFiles(data.files || [])

      toast({
        title: "Success",
        description: `${itemToAction.type === "directory" ? "Folder" : "File"} deleted successfully`,
      })

      setIsDeleteDialogOpen(false)
      setItemToAction(null)
    } catch (error) {
      console.error("Failed to delete file:", error)
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const handleRename = async (newName: string) => {
    if (!itemToAction) return

    try {
      const response = await fetch("/api/files/operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "rename",
          sourcePath: itemToAction.path,
          newName,
          type: itemToAction.type,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to rename file")
      }

      // Refresh the file tree
      const treeResponse = await fetch("/api/files/tree")
      const data = await treeResponse.json()
      setFiles(data.files || [])

      toast({
        title: "Success",
        description: `${itemToAction.type === "directory" ? "Folder" : "File"} renamed successfully`,
      })
      setIsRenameDialogOpen(false)
      setItemToAction(null)
    } catch (error) {
      console.error("Failed to rename file:", error)
      toast({
        title: "Error",
        description: "Failed to rename file",
        variant: "destructive",
      })
    }
  }

  const handleMove = async (destinationPath: string) => {
    if (!itemToAction) return

    try {
      const response = await fetch("/api/files/operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "move",
          sourcePath: itemToAction.path,
          destinationPath,
          type: itemToAction.type,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to move file")
      }

      // Refresh the file tree
      const treeResponse = await fetch("/api/files/tree")
      const data = await treeResponse.json()
      setFiles(data.files || [])

      toast({
        title: "Success",
        description: `${itemToAction.type === "directory" ? "Folder" : "File"} moved successfully`,
      })
      setIsMoveDialogOpen(false)
      setItemToAction(null)
    } catch (error) {
      console.error("Failed to move file:", error)
      toast({
        title: "Error",
        description: "Failed to move file",
        variant: "destructive",
      })
    }
  }

  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.path)
      const isSelected = selectedFile === node.path

      if (node.type === "directory") {
        return (
          <div key={node.path}>
            <div
              className={cn(
                "flex items-center py-1 px-1 rounded-md hover:bg-muted group",
                level > 0 && `ml-${level * 2}`,
              )}
            >
              <div className="flex items-center flex-1 cursor-pointer" onClick={() => toggleFolder(node.path)}>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 mr-1 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground" />
                )}
                <Folder className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="text-xs truncate">{node.name}</span>
              </div>

              <div className="opacity-0 group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setItemToAction(node)
                        setIsMoveDialogOpen(true)
                      }}
                    >
                      <MoveIcon className="h-3 w-3 mr-2" />
                      Move
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setItemToAction(node)
                        setIsRenameDialogOpen(true)
                      }}
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setItemToAction(node)
                        setIsDeleteDialogOpen(true)
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {isExpanded && node.children && <div className="ml-3">{renderTree(node.children, level + 1)}</div>}
          </div>
        )
      } else {
        return (
          <div
            key={node.path}
            className={cn(
              "flex items-center py-1 px-1 rounded-md group",
              isSelected ? "bg-muted" : "hover:bg-muted",
              level > 0 && `ml-${level * 2}`,
            )}
          >
            <div className="flex items-center flex-1 cursor-pointer" onClick={() => handleFileClick(node.path)}>
              <File className="h-3 w-3 mr-2 text-muted-foreground" />
              <span className="text-xs truncate">{node.name}</span>
            </div>

            <div className="opacity-0 group-hover:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setItemToAction(node)
                      setIsMoveDialogOpen(true)
                    }}
                  >
                    <MoveIcon className="h-3 w-3 mr-2" />
                    Move
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setItemToAction(node)
                      setIsRenameDialogOpen(true)
                    }}
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setItemToAction(node)
                      setIsDeleteDialogOpen(true)
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )
      }
    })
  }

  if (isLoading) {
    return <div className="p-2 text-xs text-muted-foreground">Loading files...</div>
  }

  return (
    <div className="h-full">
      <div className="mb-2">
        <h2 className="text-xs font-semibold">Files</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        {files.length > 0 ? renderTree(files) : <div className="p-2 text-xs text-muted-foreground">No files found</div>}
      </ScrollArea>

      {/* Move File Dialog */}
      {itemToAction && (
        <MoveFileDialog
          open={isMoveDialogOpen}
          onOpenChange={setIsMoveDialogOpen}
          item={{
            key: itemToAction.path,
            type: itemToAction.type === "directory" ? "folder" : "file",
          }}
          currentPath={itemToAction.path.split("/").slice(0, -1).join("/") + "/"}
          onMove={handleMove}
          isMarkdownFile={true}
        />
      )}

      {/* Rename File Dialog */}
      {itemToAction && (
        <RenameFileDialog
          open={isRenameDialogOpen}
          onOpenChange={setIsRenameDialogOpen}
          item={{
            key: itemToAction.path,
            type: itemToAction.type === "directory" ? "folder" : "file",
          }}
          onRename={handleRename}
          isMarkdownFile={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {itemToAction && (
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title={`Delete ${itemToAction.type === "directory" ? "Folder" : "File"}`}
          description={`Are you sure you want to delete ${itemToAction.name}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          destructive={true}
        />
      )}
    </div>
  )
}
