"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Folder, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface S3Item {
  key: string
  type: "file" | "folder"
  size?: number
  lastModified?: string
  url?: string
}

interface FolderNode {
  key: string
  name: string
  children: FolderNode[]
  isExpanded: boolean
}

interface MoveFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: S3Item
  currentPath: string
  onMove: (destinationPath: string) => void
  isMarkdownFile?: boolean
}

export function MoveFileDialog({
  open,
  onOpenChange,
  item,
  currentPath,
  onMove,
  isMarkdownFile = false,
}: MoveFileDialogProps) {
  const [folderTree, setFolderTree] = useState<FolderNode>({
    key: "",
    name: "Root",
    children: [],
    isExpanded: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState("")

  useEffect(() => {
    if (open) {
      fetchFolderTree()
    }
  }, [open])

  const fetchFolderTree = async () => {
    setIsLoading(true)
    try {
      if (isMarkdownFile) {
        // Fetch markdown folder structure
        const response = await fetch("/api/files/tree")
        const data = await response.json()

        // Convert the file tree to our folder tree format
        const convertToFolderTree = (nodes: any[], parentKey = ""): FolderNode[] => {
          return nodes
            .filter((node) => node.type === "directory")
            .map((node) => ({
              key: node.path,
              name: node.name,
              children: node.children ? convertToFolderTree(node.children, node.path) : [],
              isExpanded: false,
            }))
        }

        const rootNode = {
          key: "",
          name: "Root",
          children: convertToFolderTree(data.files || []),
          isExpanded: true,
        }

        setFolderTree(rootNode)
      } else {
        // In a real implementation, you would fetch the S3 folder structure from the API
        // For now, we'll use mock data
        const mockFolderTree = {
          key: "",
          name: "Root",
          children: [
            {
              key: "images/",
              name: "images",
              children: [
                {
                  key: "images/blog/",
                  name: "blog",
                  children: [],
                  isExpanded: false,
                },
                {
                  key: "images/projects/",
                  name: "projects",
                  children: [],
                  isExpanded: false,
                },
              ],
              isExpanded: false,
            },
            {
              key: "documents/",
              name: "documents",
              children: [],
              isExpanded: false,
            },
          ],
          isExpanded: true,
        }

        setFolderTree(mockFolderTree)
      }

      setSelectedFolder(currentPath) // Default to current path
    } catch (error) {
      console.error("Failed to fetch folder tree:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFolder = (folderKey: string) => {
    const updateFolderExpansion = (node: FolderNode): FolderNode => {
      if (node.key === folderKey) {
        return { ...node, isExpanded: !node.isExpanded }
      }

      if (node.children.length > 0) {
        return {
          ...node,
          children: node.children.map(updateFolderExpansion),
        }
      }

      return node
    }

    setFolderTree(updateFolderExpansion(folderTree))
  }

  const handleFolderSelect = (folderKey: string) => {
    setSelectedFolder(folderKey)
  }

  const handleMove = () => {
    onMove(selectedFolder)
  }

  const getItemName = (key: string): string => {
    if (isMarkdownFile) {
      // For markdown files, the key is the full path
      const parts = key.split("/")
      return parts[parts.length - 1] || "Root"
    } else {
      // For S3 items, remove trailing slash for folders
      const cleanKey = key.endsWith("/") ? key.slice(0, -1) : key
      // Get the last part of the path
      const parts = cleanKey.split("/")
      return parts[parts.length - 1] || "Root"
    }
  }

  const isItemInFolder = (itemKey: string, folderKey: string): boolean => {
    if (isMarkdownFile) {
      // For markdown files
      if (folderKey === "") {
        // Can't move to root if already in root
        return itemKey.indexOf("/") === -1
      }
      return itemKey.startsWith(folderKey) && itemKey !== folderKey
    } else {
      // For S3 items
      return itemKey.startsWith(folderKey) && itemKey !== folderKey
    }
  }

  const renderFolderTree = (node: FolderNode, level = 0) => {
    const isSelected = selectedFolder === node.key
    const isItemInThisFolder = isItemInFolder(item.key, node.key)

    return (
      <div key={node.key} className="select-none">
        <div
          className={cn(
            "flex items-center py-1 px-2 rounded-md cursor-pointer",
            isSelected ? "bg-muted" : "hover:bg-muted/50",
            isItemInThisFolder && "opacity-50 cursor-not-allowed",
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (!isItemInThisFolder) {
              handleFolderSelect(node.key)
            }
          }}
        >
          {node.children.length > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(node.key)
              }}
            >
              {node.isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          ) : (
            <div className="w-5 mr-1" />
          )}
          <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-xs truncate">{node.name}</span>
        </div>

        {node.isExpanded && node.children.length > 0 && (
          <div>{node.children.map((child) => renderFolderTree(child, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move {item.type === "folder" ? "Folder" : "File"}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-xs mb-2">
            Select destination folder for <span className="font-medium">{getItemName(item.key)}</span>:
          </p>
          <div className="border rounded-md h-60">
            <ScrollArea className="h-full p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Loading...</div>
              ) : (
                renderFolderTree(folderTree)
              )}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleMove} disabled={!selectedFolder || isItemInFolder(item.key, selectedFolder)}>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
