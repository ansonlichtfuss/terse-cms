"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./move-file-dialog.module.css";
import { useFileTreeQuery } from "@/hooks/query/useFileTreeQuery";

interface S3Item {
  key: string;
  type: "file" | "folder";
  size?: number;
  lastModified?: string;
  url?: string;
}

interface FolderNode {
  key: string;
  name: string;
  children: FolderNode[];
  isExpanded: boolean;
}

interface MoveFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: S3Item;
  currentPath: string;
  onMove: (destinationPath: string) => void;
  isMarkdownFile?: boolean;
}

interface MoveFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: S3Item;
  currentPath: string;
  onMove: (destinationPath: string) => void;
  isMarkdownFile?: boolean;
  isMoving: boolean; // Add isMoving prop
}

export function MoveFileDialog({
  open,
  onOpenChange,
  item,
  currentPath,
  onMove,
  isMarkdownFile = false,
  isMoving, // Destructure isMoving
}: MoveFileDialogProps) {
  const [selectedFolder, setSelectedFolder] = useState("");
  const [localFolderTree, setLocalFolderTree] = useState<FolderNode | null>(
    null
  );

  const { data: folderTree, isLoading, error } = useFileTreeQuery();

  useEffect(() => {
    if (open && folderTree) {
      setSelectedFolder(currentPath); // Default to current path
      setLocalFolderTree(folderTree); // Initialize local state with fetched data
    }
  }, [open, folderTree, currentPath]);

  const toggleFolder = (folderKey: string) => {
    const updateFolderExpansion = (node: FolderNode): FolderNode => {
      if (node.key === folderKey) {
        return { ...node, isExpanded: !node.isExpanded };
      }

      if (node.children.length > 0) {
        return {
          ...node,
          children: node.children.map(updateFolderExpansion),
        };
      }

      return node;
    };

    if (localFolderTree) {
      setLocalFolderTree(updateFolderExpansion(localFolderTree));
    }
  };

  const handleFolderSelect = (folderKey: string) => {
    setSelectedFolder(folderKey);
  };

  const handleMove = () => {
    onMove(selectedFolder);
  };

  const getItemName = (key: string): string => {
    if (isMarkdownFile) {
      // For markdown files, the key is the full path
      const parts = key.split("/");
      return parts[parts.length - 1] || "Root";
    } else {
      // For S3 items, remove trailing slash for folders
      const cleanKey = key.endsWith("/") ? key.slice(0, -1) : key;
      // Get the last part of the path
      const parts = cleanKey.split("/");
      return parts[parts.length - 1] || "Root";
    }
  };

  const isItemInFolder = (itemKey: string, folderKey: string): boolean => {
    const itemName = getItemName(itemKey);
    if (isMarkdownFile) {
      // For markdown files
      if (folderKey === "") {
        // Can't move to root if already in root
        return itemKey.indexOf("/") === -1;
      }
      // Check if the itemKey is directly within the folderKey
      return itemKey === `${folderKey}/${itemName}`;
    } else {
      // For S3 items
      // Check if the itemKey is directly within the folderKey
      return itemKey === `${folderKey}${itemName}`;
    }
  };

  const renderFolderTree = (node: FolderNode, level = 0) => {
    const isSelected = selectedFolder === node.key;
    const isItemInThisFolder = isItemInFolder(item.key, node.key);

    return (
      <div key={node.key} className="select-none">
        <div
          className={cn(
            "flex items-center py-1 px-2 rounded-md cursor-pointer",
            isSelected ? "bg-muted" : "hover:bg-muted/50",
            isItemInThisFolder && "opacity-50 cursor-not-allowed"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (!isItemInThisFolder) {
              handleFolderSelect(node.key);
            }
          }}
        >
          {node.children.length > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.key);
              }}
            >
              {node.isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-5 mr-1" />
          )}
          <Folder className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
          <span className={`text-xs ${styles.folderName}`}>{node.name}</span>
        </div>

        {node.isExpanded && node.children.length > 0 && (
          <div>
            {node.children.map((child) => renderFolderTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Move {item.type === "folder" ? "Folder" : "File"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-xs mb-2">
            Select destination folder for{" "}
            <span className="font-medium">{getItemName(item.key)}</span>:
          </p>
          <div className="border rounded-md h-60">
            <div className="h-full p-2 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  Loading...
                </div>
              ) : localFolderTree ? (
                renderFolderTree(localFolderTree)
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  Error loading folder tree.
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleMove}
            disabled={
              !selectedFolder ||
              isItemInFolder(item.key, selectedFolder) ||
              isMoving // Disable while moving
            }
          >
            {isMoving ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
