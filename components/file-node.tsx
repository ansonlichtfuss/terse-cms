"use client"

import type React from "react"

import { Folder, File, MoreHorizontal, Edit, Trash2, MoveIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { FileNode } from "@/types"

interface FileNodeProps {
  node: FileNode
  level: number
  isExpanded: boolean
  isSelected: boolean
  onToggleFolder: (path: string, e: React.MouseEvent) => void
  onFileClick: (path: string) => void
  onMoveClick: (node: FileNode) => void
  onRenameClick: (node: FileNode) => void
  onDeleteClick: (node: FileNode) => void
}

export function FileNodeComponent({
  node,
  level,
  isExpanded,
  isSelected,
  onToggleFolder,
  onFileClick,
  onMoveClick,
  onRenameClick,
  onDeleteClick,
}: FileNodeProps) {
  if (node.type === "directory") {
    return (
      <div
        className={cn("flex items-center py-1 px-1 rounded-md hover:bg-muted group file-row w-full")}
        onClick={(e) => onToggleFolder(node.path, e)}
      >
        <div className="flex items-center min-w-0 overflow-hidden flex-1 pr-1">
          <Folder className="h-3 w-3 mr-1 text-muted-foreground flex-shrink-0" />
          <span className="text-xs truncate block w-full" title={node.name}>
            {node.name}
          </span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveClick(node)
                }}
              >
                <MoveIcon className="h-3 w-3 mr-2" />
                Move
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onRenameClick(node)
                }}
              >
                <Edit className="h-3 w-3 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteClick(node)
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
  } else {
    return (
      <div
        key={node.path}
        className={cn(
          "flex items-center py-1 px-1 rounded-md group transition-colors file-row w-full",
          isSelected ? "bg-gradient-secondary font-medium selected" : "hover:bg-muted",
        )}
        onClick={() => onFileClick(node.path)}
      >
        <div className="flex items-center min-w-0 overflow-hidden flex-1 pr-1">
          <File className="h-3 w-3 mr-2 text-muted-foreground flex-shrink-0" />
          <span className="text-xs truncate block w-full" title={node.name}>
            {node.name}
          </span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveClick(node)
                }}
              >
                <MoveIcon className="h-3 w-3 mr-2" />
                Move
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onRenameClick(node)
                }}
              >
                <Edit className="h-3 w-3 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteClick(node)
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
}
