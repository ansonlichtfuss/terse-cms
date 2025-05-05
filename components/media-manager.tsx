"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Folder,
  File,
  Upload,
  FolderPlus,
  Trash2,
  RefreshCw,
  ChevronLeft,
  LayoutGrid,
  List,
  MoreHorizontal,
  Edit,
  MoveIcon,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MoveFileDialog } from "@/components/move-file-dialog"
import { RenameFileDialog } from "@/components/rename-file-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

interface S3Item {
  key: string
  type: "file" | "folder"
  size?: number
  lastModified?: string
  url?: string
}

interface MediaManagerProps {
  onSelect?: (url: string) => void
  isMobile?: boolean
  inSidebar?: boolean
}

export function MediaManager({ onSelect, isMobile = false, inSidebar = false }: MediaManagerProps) {
  const [items, setItems] = useState<S3Item[]>([])
  const [currentPath, setCurrentPath] = useState("")
  const [selectedItem, setSelectedItem] = useState<S3Item | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMobile || inSidebar ? "list" : "grid")
  const [mounted, setMounted] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToAction, setItemToAction] = useState<S3Item | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchItems(currentPath)
  }, [currentPath])

  useEffect(() => {
    // Update view mode based on screen size or sidebar context
    setViewMode(isMobile || inSidebar ? "list" : "grid")
  }, [isMobile, inSidebar])

  const fetchItems = async (path: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/s3?path=${encodeURIComponent(path)}`)
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error("Failed to fetch S3 items:", error)
      toast({
        title: "Error",
        description: "Failed to fetch media items",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleItemClick = (item: S3Item) => {
    if (item.type === "folder") {
      setCurrentPath(item.key)
    } else {
      setSelectedItem(item)
      if (onSelect && item.url) {
        onSelect(item.url)
      }
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

      // Refresh the list
      fetchItems(currentPath)
      toast({
        title: "Success",
        description: `${itemToAction.type === "folder" ? "Folder" : "File"} deleted successfully`,
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
      // Mock implementation for now
      toast({
        title: "Success",
        description: `${itemToAction.type === "folder" ? "Folder" : "File"} renamed successfully`,
      })

      // In a real implementation, you would call an API endpoint to rename the file/folder
      // and then refresh the items list
      fetchItems(currentPath)
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
      // Mock implementation for now
      toast({
        title: "Success",
        description: `${itemToAction.type === "folder" ? "Folder" : "File"} moved successfully`,
      })

      // In a real implementation, you would call an API endpoint to move the file/folder
      // and then refresh the items list
      fetchItems(currentPath)
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

  const navigateUp = () => {
    if (!currentPath) return

    const parts = currentPath.split("/")
    // Remove the last part (which is empty due to trailing slash)
    if (parts[parts.length - 1] === "") {
      parts.pop()
    }
    // Remove the folder name
    parts.pop()
    // Add back the trailing slash if not at root
    const newPath = parts.length > 0 ? parts.join("/") + "/" : ""
    setCurrentPath(newPath)
  }

  const getItemName = (key: string): string => {
    // Remove trailing slash for folders
    const cleanKey = key.endsWith("/") ? key.slice(0, -1) : key
    // Get the last part of the path
    const parts = cleanKey.split("/")
    return parts[parts.length - 1] || "Root"
  }

  const renderBreadcrumbs = () => {
    const parts = currentPath.split("/").filter(Boolean)

    if (isMobile || inSidebar) {
      return (
        <div className="flex items-center text-sm mb-2 overflow-x-auto">
          <Button variant="ghost" size="sm" className="font-semibold flex items-center h-7 px-2" onClick={navigateUp}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {parts.length > 0 ? getItemName(parts[parts.length - 1]) : "Root"}
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center text-sm mb-4 overflow-x-auto">
        <Button variant="ghost" size="sm" className="font-semibold" onClick={() => setCurrentPath("")}>
          Root
        </Button>

        {parts.map((part, index) => (
          <div key={index} className="flex items-center">
            <span className="mx-1">/</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const path = parts.slice(0, index + 1).join("/") + "/"
                setCurrentPath(path)
              }}
            >
              {getItemName(part)}
            </Button>
          </div>
        ))}
      </div>
    )
  }

  const renderGridView = () => (
    <div className={`grid ${isMobile ? "grid-cols-2 gap-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"}`}>
      {currentPath && (
        <div
          className="border rounded-md p-2 flex flex-col items-center cursor-pointer hover:bg-muted"
          onClick={navigateUp}
        >
          <Folder className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-xs truncate w-full text-center">..</span>
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.key}
          className={cn(
            "border rounded-md p-2 flex flex-col items-center cursor-pointer hover:bg-muted relative group",
            selectedItem?.key === item.key && "bg-muted",
          )}
          onClick={() => handleItemClick(item)}
        >
          {item.type === "folder" ? (
            <Folder className="h-8 w-8 text-muted-foreground mb-2" />
          ) : item.url && item.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <div className="h-16 w-16 mb-2 relative">
              <img
                src={item.url || "/placeholder.svg"}
                alt={getItemName(item.key)}
                className="h-full w-full object-cover rounded-md"
              />
            </div>
          ) : (
            <File className="h-8 w-8 text-muted-foreground mb-2" />
          )}

          <span className="text-xs truncate w-full text-center">{getItemName(item.key)}</span>

          <div className={`absolute top-1 right-1 ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setItemToAction(item)
                    setIsMoveDialogOpen(true)
                  }}
                >
                  <MoveIcon className="h-4 w-4 mr-2" />
                  Move
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setItemToAction(item)
                    setIsRenameDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setItemToAction(item)
                    setIsDeleteDialogOpen(true)
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-1">
      {currentPath && (
        <div className="flex items-center p-1 rounded-md cursor-pointer hover:bg-muted" onClick={navigateUp}>
          <Folder className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="text-xs">..</span>
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.key}
          className={cn(
            "flex items-center justify-between py-1 px-2 rounded-md cursor-pointer hover:bg-muted",
            selectedItem?.key === item.key && "bg-muted",
          )}
          onClick={() => handleItemClick(item)}
        >
          <div className="flex items-center flex-1 min-w-0">
            {item.type === "folder" ? (
              <Folder className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
            ) : item.url && item.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <div className="h-6 w-6 mr-2 flex-shrink-0">
                <img
                  src={item.url || "/placeholder.svg"}
                  alt={getItemName(item.key)}
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
            ) : (
              <File className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
            )}
            <span className="text-xs truncate">{getItemName(item.key)}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setItemToAction(item)
                  setIsMoveDialogOpen(true)
                }}
              >
                <MoveIcon className="h-4 w-4 mr-2" />
                Move
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setItemToAction(item)
                  setIsRenameDialogOpen(true)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setItemToAction(item)
                  setIsDeleteDialogOpen(true)
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )

  // Render action buttons with tooltips
  const renderActionButtons = () => {
    if (!mounted) return null

    return (
      <TooltipProvider delayDuration={300}>
        <div className={`flex ${inSidebar ? "gap-1" : "gap-2"}`}>
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
            <TooltipContent side="bottom">
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
            <TooltipContent side="bottom">
              <p>New Folder</p>
            </TooltipContent>
          </Tooltip>

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
            <TooltipContent side="bottom">
              <p>Upload File</p>
            </TooltipContent>
          </Tooltip>

          {!isMobile && !inSidebar && (
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
              <TooltipContent side="bottom">
                <p>Change View</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className={`flex ${isMobile || inSidebar ? "flex-col space-y-1" : "items-center justify-between"} mb-2`}>
        <h2 className="text-sm font-semibold">Media Manager</h2>
        {renderActionButtons()}
      </div>

      {renderBreadcrumbs()}

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">Loading...</div>
        ) : items.length > 0 ? (
          isMobile || inSidebar || viewMode === "list" ? (
            renderListView()
          ) : (
            renderGridView()
          )
        ) : (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">No items found</div>
        )}
      </ScrollArea>

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
          item={itemToAction}
          currentPath={currentPath}
          onMove={handleMove}
        />
      )}

      {/* Rename File Dialog */}
      {itemToAction && (
        <RenameFileDialog
          open={isRenameDialogOpen}
          onOpenChange={setIsRenameDialogOpen}
          item={itemToAction}
          onRename={handleRename}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {itemToAction && (
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title={`Delete ${itemToAction.type === "folder" ? "Folder" : "File"}`}
          description={`Are you sure you want to delete ${getItemName(itemToAction.key)}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          destructive={true}
        />
      )}
    </div>
  )
}
