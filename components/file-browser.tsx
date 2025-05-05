"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { MoveFileDialog } from "@/components/move-file-dialog"
import { RenameFileDialog } from "@/components/rename-file-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { PathBreadcrumbs } from "@/components/path-breadcrumbs"
import { Home, Folder, File, MoreHorizontal, Upload, FolderPlus, RefreshCw, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { FileNode } from "@/types"

export interface FileItem {
  key: string
  path?: string
  name?: string
  type: "file" | "folder" | "directory"
  children?: FileItem[]
  size?: number
  lastModified?: string
  url?: string
}

interface FileBrowserProps {
  type: "files" | "media"
  onSelect: (path: string, url?: string) => void
  isMobile?: boolean
  inSidebar?: boolean
}

export function FileBrowser({ type, onSelect, isMobile = false, inSidebar = false }: FileBrowserProps) {
  const [items, setItems] = useState<FileItem[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToAction, setItemToAction] = useState<FileItem | null>(null)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [currentDirContents, setCurrentDirContents] = useState<FileItem[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isUploading, setIsUploading] = useState(isMobile)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMobile || inSidebar ? "list" : "grid")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchItems(currentPath)
  }, [currentPath, type])

  useEffect(() => {
    // Update view mode based on screen size or sidebar context
    setViewMode(isMobile || inSidebar ? "list" : "grid")
  }, [isMobile, inSidebar])

  const fetchItems = async (path: string) => {
    setIsLoading(true)
    try {
      if (type === "files") {
        const response = await fetch("/api/files/tree")
        const data = await response.json()

        // Convert file tree to flat structure for current directory
        const files = data.files || []

        if (path === "") {
          // At root level, show all top-level files and directories
          setCurrentDirContents(files.map(fileNodeToFileItem))
        } else {
          // Find the directory node that matches the current path
          const pathParts = path.split("/").filter(Boolean)
          let currentDir = files
          let found = false

          // Navigate through the path parts to find the current directory
          for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i]
            const nextDir = currentDir.find((node) => node.name === part && node.type === "directory")

            if (nextDir && nextDir.children) {
              currentDir = nextDir.children
              found = true
            } else {
              found = false
              break
            }
          }

          if (found) {
            setCurrentDirContents(currentDir.map(fileNodeToFileItem))
          } else {
            // If directory not found, reset to root
            setCurrentPath("")
            setCurrentDirContents(files.map(fileNodeToFileItem))
          }
        }

        setItems(files.map(fileNodeToFileItem))
      } else {
        // For media files (S3)
        const response = await fetch(`/api/s3?path=${encodeURIComponent(path)}`)
        const data = await response.json()
        setItems(data.items || [])
        setCurrentDirContents(data.items || [])
      }
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error)
      toast({
        title: "Error",
        description: `Failed to fetch ${type}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Convert FileNode to FileItem
  const fileNodeToFileItem = (node: FileNode): FileItem => {
    return {
      key: node.path,
      path: node.path,
      name: node.name,
      type: node.type,
      children: node.children ? node.children.map(fileNodeToFileItem) : undefined,
    }
  }

  const getItemName = (item: FileItem): string => {
    if (item.name) return item.name

    // For S3 items that don't have a name property
    const key = item.key
    // Remove trailing slash for folders
    const cleanKey = key.endsWith("/") ? key.slice(0, -1) : key
    // Get the last part of the path
    const parts = cleanKey.split("/")
    return parts[parts.length - 1] || "Root"
  }

  const getItemPath = (item: FileItem): string => {
    return item.path || item.key
  }

  // Update the handleItemClick function to safely call onSelect
  const handleItemClick = (item: FileItem) => {
    const itemPath = getItemPath(item)

    if (item.type === "folder" || item.type === "directory") {
      if (type === "files") {
        setCurrentPath(itemPath)
      } else {
        // For S3, add trailing slash for folders
        setCurrentPath(itemPath.endsWith("/") ? itemPath : `${itemPath}/`)
      }
    } else {
      setSelectedItem(itemPath)
      if (type === "files") {
        // Make sure onSelect is a function before calling it
        if (typeof onSelect === "function") {
          onSelect(itemPath)
        }
      } else if (item.url) {
        // Make sure onSelect is a function before calling it
        if (typeof onSelect === "function") {
          onSelect(itemPath, item.url)
        }
      }
    }
  }

  const handleBreadcrumbNavigation = (path: string) => {
    if (type === "files") {
      setCurrentPath(path)
    } else {
      // For S3, add trailing slash for folders
      const formattedPath = path ? `${path}/` : ""
      setCurrentPath(formattedPath)
    }

    // Reset expanded folders when navigating to root
    if (path === "") {
      setExpandedFolders(new Set())
    } else {
      // Ensure this folder is expanded
      setExpandedFolders((prev) => {
        const newSet = new Set(prev)
        newSet.add(path)
        return newSet
      })
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("path", currentPath)
      formData.append("file", files[0])

      const response = await fetch("/api/s3/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      // Refresh the list
      fetchItems(currentPath)
      toast({
        title: "Success",
        description: "File uploaded successfully",
      })
    } catch (error) {
      console.error("Failed to upload file:", error)
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      if (type === "media") {
        const response = await fetch("/api/s3/folder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: currentPath,
            name: newFolderName,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create folder")
        }
      } else {
        // For files, implement folder creation API call
        // This would need to be implemented in the backend
        toast({
          title: "Not implemented",
          description: "Folder creation for files is not implemented yet",
        })
      }

      // Refresh the list
      fetchItems(currentPath)
      setIsCreatingFolder(false)
      setNewFolderName("")
      toast({
        title: "Success",
        description: "Folder created successfully",
      })
    } catch (error) {
      console.error("Failed to create folder:", error)
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!itemToAction) return

    try {
      if (type === "files") {
        const response = await fetch("/api/files", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: getItemPath(itemToAction) }),
        })

        if (!response.ok) {
          throw new Error("Failed to delete file")
        }
      } else {
        const response = await fetch("/api/s3", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: itemToAction.key,
            type: itemToAction.type,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to delete item")
        }
      }

      // Refresh the list
      fetchItems(currentPath)
      toast({
        title: "Success",
        description: `${itemToAction.type === "directory" || itemToAction.type === "folder" ? "Folder" : "File"} deleted successfully`,
      })

      setIsDeleteDialogOpen(false)
      setItemToAction(null)
    } catch (error) {
      console.error("Failed to delete item:", error)
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  const handleRename = async (newName: string) => {
    if (!itemToAction) return

    try {
      if (type === "files") {
        const response = await fetch("/api/files/operations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "rename",
            sourcePath: getItemPath(itemToAction),
            newName,
            type: itemToAction.type === "directory" ? "directory" : "file",
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to rename file")
        }
      } else {
        // For media, implement rename API call
        // This would need to be implemented in the backend
        toast({
          title: "Not implemented",
          description: "Rename for media is not implemented yet",
        })
      }

      // Refresh the list
      fetchItems(currentPath)
      toast({
        title: "Success",
        description: `${itemToAction.type === "directory" || itemToAction.type === "folder" ? "Folder" : "File"} renamed successfully`,
      })
      setIsRenameDialogOpen(false)
      setItemToAction(null)
    } catch (error) {
      console.error("Failed to rename item:", error)
      toast({
        title: "Error",
        description: "Failed to rename item",
        variant: "destructive",
      })
    }
  }

  const handleMove = async (destinationPath: string) => {
    if (!itemToAction) return

    try {
      if (type === "files") {
        const response = await fetch("/api/files/operations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "move",
            sourcePath: getItemPath(itemToAction),
            destinationPath,
            type: itemToAction.type === "directory" ? "directory" : "file",
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to move file")
        }
      } else {
        // For media, implement move API call
        // This would need to be implemented in the backend
        toast({
          title: "Not implemented",
          description: "Move for media is not implemented yet",
        })
      }

      // Refresh the list
      fetchItems(currentPath)
      toast({
        title: "Success",
        description: `${itemToAction.type === "directory" || itemToAction.type === "folder" ? "Folder" : "File"} moved successfully`,
      })
      setIsMoveDialogOpen(false)
      setItemToAction(null)
    } catch (error) {
      console.error("Failed to move item:", error)
      toast({
        title: "Error",
        description: "Failed to move item",
        variant: "destructive",
      })
    }
  }

  // Render action buttons with tooltips
  const renderActionButtons = () => {
    if (!mounted) return null

    return (
      <TooltipProvider delayDuration={300}>
        <div className={`flex ${inSidebar ? "gap-1" : "gap-2"} justify-center`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={inSidebar ? "icon" : "sm"}
                onClick={() => fetchItems(currentPath)}
                className="flex-shrink-0 h-7 w-7"
              >
                <RefreshCw className={inSidebar ? "h-3 w-3" : "h-3 w-3 mr-1"} />
                {!inSidebar && "Refresh"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Refresh</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={inSidebar ? "icon" : "sm"}
                onClick={() => setIsCreatingFolder(true)}
                className="flex-shrink-0 h-7 w-7"
              >
                <FolderPlus className={inSidebar ? "h-3 w-3" : "h-3 w-3 mr-1"} />
                {!inSidebar && "New Folder"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>New Folder</p>
            </TooltipContent>
          </Tooltip>

          {type === "media" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative flex-shrink-0">
                  <Input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleUpload}
                    disabled={isUploading}
                  />
                  <Button variant="outline" size={inSidebar ? "icon" : "sm"} disabled={isUploading} className="h-7 w-7">
                    <Upload className={inSidebar ? "h-3 w-3" : "h-3 w-3 mr-1"} />
                    {!inSidebar && "Upload"}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Upload File</p>
              </TooltipContent>
            </Tooltip>
          )}

          {type === "media" && !isMobile && !inSidebar && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="flex-shrink-0"
                >
                  {viewMode === "grid" ? (
                    <>
                      <List className="h-3 w-3 mr-1" />
                      List View
                    </>
                  ) : (
                    <>
                      <LayoutGrid className="h-3 w-3 mr-1" />
                      Grid View
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Change View</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    )
  }

  const renderListView = () => (
    <div className="space-y-1 px-0 w-full max-w-full">
      {currentDirContents.map((item) => {
        const itemPath = getItemPath(item)
        const isSelected = selectedItem === itemPath
        const itemName = getItemName(item)
        const isFolder = item.type === "folder" || item.type === "directory"
        const isMarkdownFile = type === "files" && !isFolder

        return (
          <div
            key={itemPath}
            className={cn(
              "flex items-center justify-between py-1 px-1 rounded-md cursor-pointer hover:bg-muted w-full",
              isSelected && "bg-muted",
            )}
            onClick={() => handleItemClick(item)}
          >
            <div className="flex items-center min-w-0 overflow-hidden flex-1 pr-1">
              {isFolder ? (
                <Folder className="h-4 w-4 text-muted-foreground mr-1 flex-shrink-0" />
              ) : type === "media" && item.url && item.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <div className="h-6 w-6 mr-1 flex-shrink-0">
                  <img
                    src={item.url || "/placeholder.svg"}
                    alt={itemName}
                    className="h-full w-full object-cover rounded-md"
                  />
                </div>
              ) : (
                type === "media" && <File className="h-4 w-4 text-muted-foreground mr-1 flex-shrink-0" />
              )}
              <span className="text-xs truncate block w-full" title={itemName}>
                {itemName}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                setItemToAction(item)
                setIsDeleteDialogOpen(true)
              }}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        )
      })}
    </div>
  )

  const renderGridView = () => (
    <div className={`grid ${isMobile ? "grid-cols-2 gap-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"}`}>
      {currentDirContents.map((item) => {
        const itemPath = getItemPath(item)
        const isSelected = selectedItem === itemPath
        const itemName = getItemName(item)
        const isFolder = item.type === "folder" || item.type === "directory"
        const isMarkdownFile = type === "files" && !isFolder

        return (
          <div
            key={itemPath}
            className={cn(
              "border rounded-md p-2 flex flex-col items-center cursor-pointer hover:bg-muted relative group",
              isSelected && "bg-muted",
            )}
            onClick={() => handleItemClick(item)}
          >
            {isFolder ? (
              <Folder className="h-8 w-8 text-muted-foreground mb-2" />
            ) : type === "media" && item.url && item.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <div className="h-16 w-16 mb-2 relative">
                <img
                  src={item.url || "/placeholder.svg"}
                  alt={itemName}
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
            ) : (
              type === "media" && <File className="h-8 w-8 text-muted-foreground mb-2" />
            )}

            <span className="text-xs truncate w-full text-center overflow-hidden" title={itemName}>
              {itemName}
            </span>

            <div className={`absolute top-1 right-1 ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  setItemToAction(item)
                  setIsDeleteDialogOpen(true)
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="h-full flex flex-col relative w-full max-w-full overflow-hidden">
      <PathBreadcrumbs
        currentPath={currentPath.replace(/\/$/, "")} // Remove trailing slash for display
        onNavigate={handleBreadcrumbNavigation}
        className="breadcrumbs w-full max-w-full" // Use a common class for both file and media breadcrumbs
        itemClassName="breadcrumb-item"
        separatorClassName="breadcrumb-separator"
        currentClassName="breadcrumb-current"
        rootIcon={<Home size={12} />}
      />

      {/* Main content area with padding at the bottom to account for the action bar */}
      <div className="flex-1 overflow-hidden relative h-full w-full max-w-full">
        <ScrollArea className="h-full w-full max-w-full" style={{ height: "calc(100% - 12px)" }}>
          <div className="px-0 py-1 pb-16 w-full max-w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">Loading...</div>
            ) : currentDirContents.length > 0 ? (
              type === "media" && !inSidebar && !isMobile && viewMode === "grid" ? (
                renderGridView()
              ) : (
                renderListView()
              )
            ) : (
              <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">No items found</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Fixed action buttons at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/80 backdrop-blur-sm border-t border-border z-10 w-full">
        {renderActionButtons()}
      </div>

      <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
        <DialogContent className={isMobile ? "w-[95vw] max-w-[95vw]" : ""}>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input placeholder="Folder name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move File Dialog */}
      {itemToAction && (
        <MoveFileDialog
          open={isMoveDialogOpen}
          onOpenChange={setIsMoveDialogOpen}
          item={{
            key: getItemPath(itemToAction),
            type: itemToAction.type === "directory" || itemToAction.type === "folder" ? "folder" : "file",
          }}
          currentPath={
            type === "files" ? getItemPath(itemToAction).split("/").slice(0, -1).join("/") + "/" : currentPath
          }
          onMove={handleMove}
          isMarkdownFile={type === "files"}
        />
      )}

      {/* Rename File Dialog */}
      {itemToAction && (
        <RenameFileDialog
          open={isRenameDialogOpen}
          onOpenChange={setIsRenameDialogOpen}
          item={{
            key: getItemPath(itemToAction),
            type: itemToAction.type === "directory" || itemToAction.type === "folder" ? "folder" : "file",
          }}
          onRename={handleRename}
          isMarkdownFile={type === "files"}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {itemToAction && (
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title={`Delete ${itemToAction.type === "directory" || itemToAction.type === "folder" ? "Folder" : "File"}`}
          description={`Are you sure you want to delete ${getItemName(itemToAction)}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          destructive={true}
        />
      )}
    </div>
  )
}
