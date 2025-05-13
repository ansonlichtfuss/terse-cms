"use client";

import type React from "react";
import { useState } from "react"; // Import useState

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import styles from "./FileBrowser.module.css";
import { cn } from "@/lib/utils";
import { MoveFileDialog } from "@/components/move-file-dialog";
import { PathBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";
import { RenameFileDialog } from "@/components/rename-file-dialog";
import { Home } from "lucide-react";

// Import the new hooks and components
import { CreateFolderDialog } from "./CreateFolderDialog"; // Assuming dialogs are also moved
import { FileBrowserActions } from "./FileBrowserActions";
import { FileItemRow } from "./FileItemRow";
import { useFileBrowserState } from "./useFileBrowserState";
import { useFileFetching } from "./useFileFetching";
import { useFileOperations } from "./useFileOperations";
import { getItemName, getItemPath } from "./utils"; // Import utility functions
import { useRouter } from "next/navigation";
import { Router } from "next/router";
import UploadDialog from "./UploadDialog"; // Import UploadDialog from the same directory

// FileItem type definition remains here for now, as it's used by multiple components/hooks
export interface FileItem {
  key: string;
  path?: string;
  name?: string;
  type: "file" | "folder" | "directory";
  children?: FileItem[];
  size?: number;
  lastModified?: string;
  url?: string;
}

interface FileBrowserProps {
  type: "files" | "media";
  onSelect?: (path: string, url?: string) => void;
  selectedPath?: string;
  isMobile?: boolean;
}

export function FileBrowser({
  type,
  onSelect,
  selectedPath,
  isMobile = false,
}: FileBrowserProps) {
  // Use the custom state hook, passing selectedPath
  const {
    selectedItem,
    setSelectedItem,
    isMoveDialogOpen,
    setIsMoveDialogOpen,
    isRenameDialogOpen,
    setIsRenameDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    itemToAction,
    setItemToAction,
    currentPath,
    setCurrentPath,
    expandedFolders,
    setExpandedFolders,
    isUploading,
    setIsUploading,
    isCreatingFolder,
    setIsCreatingFolder,
    newFolderName,
    setNewFolderName,
    mounted,
  } = useFileBrowserState({ isMobile, selectedPath });

  const router = useRouter();

  // Add state for the upload dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Use the custom fetching hook
  const { currentDirContents, isLoading, fetchItems } = useFileFetching({
    currentPath,
    type,
  });

  // Use the custom operations hook
  const {
    handleUpload,
    handleCreateFolder,
    handleDelete,
    handleRename,
    handleMove,
  } = useFileOperations({
    type,
    currentPath,
    fetchItems, // Pass fetchItems for refreshing after operations
    setIsDeleteDialogOpen, // Pass the state setter for the delete dialog
    setItemToAction, // Pass the state setter for the item in action
  });

  // Local handler for item clicks
  const handleItemClick = (item: FileItem) => {
    const itemPath = getItemPath(item);

    if (item.type === "folder" || item.type === "directory") {
      if (type === "files") {
        setCurrentPath(itemPath);
      } else {
        // For S3, add trailing slash for folders
        setCurrentPath(itemPath.endsWith("/") ? itemPath : `${itemPath}/`);
      }
    } else {
      setSelectedItem(itemPath);
      if (type === "files") {
        // If using URL routing, the Link component in FileItemRow will handle navigation
        // Otherwise, use the callback
        if (typeof onSelect === "function") {
          onSelect(itemPath);
        }
      } else {
        router.push(`/edit/${item.path}`);
        // For media items, always use the callback
        if (typeof onSelect === "function") {
          onSelect(itemPath, item.path);
        }
      }
    }
  };

  // Local handler for breadcrumb navigation
  const handleBreadcrumbNavigation = (path: string) => {
    if (type === "files") {
      setCurrentPath(path);
    } else {
      // For S3, add trailing slash for folders
      const formattedPath = path ? `${path}/` : "";
      setCurrentPath(formattedPath);
    }

    // Reset expanded folders when navigating to root
    if (path === "") {
      setExpandedFolders(new Set());
    } else {
      // Ensure this folder is expanded
      setExpandedFolders((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.add(path);
        return newSet;
      });
    }
  };
  // Local handler to open delete dialog
  const openDeleteDialog = (item: FileItem) => {
    setItemToAction(item);
    setIsDeleteDialogOpen(true);
  };

  // Local handler to open rename dialog
  const openRenameDialog = (item: FileItem) => {
    setItemToAction(item);
    setIsRenameDialogOpen(true);
  };

  // Local handler to open move dialog
  const openMoveDialog = (item: FileItem) => {
    setItemToAction(item);
    setIsMoveDialogOpen(true);
  };

  // Local handler for create folder button click
  const handleNewFolderButtonClick = () => {
    setIsCreatingFolder(true);
  };

  // Local handler to open the upload dialog
  const handleOpenUploadDialog = () => {
    setIsUploadDialogOpen(true);
  };

  // Local handler to close the upload dialog
  const handleCloseUploadDialog = () => {
    setIsUploadDialogOpen(false);
    // TODO: Refresh file list after upload dialog is closed
  };

  return (
    <div className={styles["file-browser"]}>
      {/* Use the FileBrowserActions component */}
      <FileBrowserActions
        type={type}
        isUploading={isUploading}
        onRefresh={() => fetchItems(currentPath)} // Call fetchItems from fetching hook
        onNewFolderClick={handleNewFolderButtonClick} // Call local handler
        onOpenUploadDialog={handleOpenUploadDialog} // Pass the handler to open the dialog
        currentPath={currentPath} // Pass the currentPath prop
      />
      <div className="px-4">
        <PathBreadcrumbs
          currentPath={currentPath.replace(/\/$/, "")} // Remove trailing slash for display
          onNavigate={handleBreadcrumbNavigation}
          rootIcon={<Home size={12} />}
          type={type}
        />
      </div>

      {/* Main content area with padding at the bottom to account for the action bar */}
      <div
        className={cn(
          "px-4 pt-2 pb-8 overflow-y-auto max-h-[calc(100vh-180px)]"
        )}
      >
        {!currentDirContents && isLoading && (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
            Loading...
          </div>
        )}
        {currentDirContents.length > 0 && (
          // Render list view using FileItemRow component
          <div className="space-y-1 px-0 max-h-full">
            {currentDirContents.map((item) => (
              <FileItemRow
                key={getItemPath(item)}
                item={item}
                isSelected={selectedItem === getItemPath(item)}
                type={type}
                onItemClick={handleItemClick}
                onDeleteClick={openDeleteDialog} // Pass local handler to open delete dialog
                onRenameClick={openRenameDialog} // Pass local handler to open rename dialog
                onMoveClick={openMoveDialog} // Pass local handler to open move dialog
              />
            ))}
          </div>
        )}
        {!currentDirContents && !isLoading && (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
            No items found
          </div>
        )}
      </div>

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={isCreatingFolder}
        onOpenChange={setIsCreatingFolder}
        onCreate={handleCreateFolder} // Pass the handleCreateFolder function directly
        isMobile={isMobile}
      />

      {/* Move File Dialog */}
      {itemToAction && (
        <MoveFileDialog
          open={isMoveDialogOpen}
          onOpenChange={setIsMoveDialogOpen}
          item={{
            key: getItemPath(itemToAction),
            type:
              itemToAction.type === "directory" ||
              itemToAction.type === "folder"
                ? "folder"
                : "file",
          }}
          currentPath={
            type === "files"
              ? getItemPath(itemToAction).split("/").slice(0, -1).join("/") +
                "/"
              : currentPath
          }
          onMove={(destinationPath) =>
            handleMove(itemToAction, destinationPath)
          } // Call handleMove from operations hook
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
            type:
              itemToAction.type === "directory" ||
              itemToAction.type === "folder"
                ? "folder"
                : "file",
          }}
          onRename={(newName: string) => handleRename(itemToAction, newName)} // Call handleRename from operations hook
          isMarkdownFile={type === "files"}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {itemToAction && (
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title={`Delete ${
            itemToAction.type === "directory" || itemToAction.type === "folder"
              ? "Folder"
              : "File"
          }`}
          description={`Are you sure you want to delete ${getItemName(
            itemToAction
          )}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDelete(itemToAction)} // Call handleDelete from operations hook
          destructive={true}
        />
      )}

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={handleCloseUploadDialog}
        uploadPath={currentPath} // Pass the currentPath to the UploadDialog
      />
    </div>
  );
}
