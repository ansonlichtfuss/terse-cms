'use client';

import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'; // Import React and useState

import { Breadcrumbs } from '@/components/breadcrumbs/breadcrumbs';
import { MoveFileDialog } from '@/components/file-browser/move-file-dialog';
import { RenameFileDialog } from '@/components/rename-file-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
// Import the new Tanstack Query hook
import { useFilesQuery } from '@/hooks/api/use-files-query';
import { cn } from '@/lib/utils';

// Import the new hooks and components
import { CreateFolderDialog } from './create-folder-dialog'; // Assuming dialogs are also moved
import styles from './file-browser.module.css';
import { FileBrowserActions } from './file-browser-actions';
import { FileItemRow } from './file-item-row';
import UploadDialog from './upload-dialog'; // Import UploadDialog from the same directory
import { useFileBrowserState } from './use-file-browser-state';
import { useFileOperations } from './use-file-operations';
import { getItemName, getItemPath } from './utils'; // Import utility functions

// FileItem type definition remains here for now, as it's used by multiple components/hooks
export interface FileItem {
  key: string;
  path?: string;
  name?: string;
  type: 'file' | 'folder' | 'directory';
  children?: FileItem[];
  size?: number;
  lastModified?: string;
  url?: string;
}

interface FileBrowserProps {
  type: 'files' | 'media';
  onSelect?: (path: string, url?: string) => void;
  selectedPath?: string;
  isMobile?: boolean;
  onPathChange?: (path: string, type: 'files' | 'media') => void; // Modify onPathChange prop to include type
}

export function FileBrowser({
  type,
  onSelect,
  selectedPath,
  isMobile = false,
  onPathChange // Receive onPathChange prop
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
    isCreateFolderDialogOpen,
    setIsCreateFolderDialogOpen,
    newFolderName,
    setNewFolderName,
    mounted
  } = useFileBrowserState({ isMobile, selectedPath });

  // Create a handler that calls both setCurrentPath and onPathChange
  const handlePathChange = (path: string) => {
    setCurrentPath(path);
    if (onPathChange) {
      onPathChange(path, type); // Pass the type along with the path
    }
  };

  const router = useRouter();

  // Add state for the upload dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Use the new Tanstack Query hook for fetching files
  const {
    data: items,
    isLoading,
    error,
    refetch
  } = useFilesQuery({
    currentPath,
    type
  });

  // Filter items to get current directory contents (logic moved from useFileFetching)
  const currentDirContents = React.useMemo(() => {
    if (!items) return [];

    if (type === 'files') {
      if (currentPath === '') {
        // At root level, show all top-level files and directories
        return items.filter((item) => !item.path?.includes('/'));
      } else {
        // Find the directory node that matches the current path
        const pathParts = currentPath.split('/').filter(Boolean);
        let currentDir: FileItem[] | undefined = items;

        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          const nextDir: FileItem | undefined = currentDir?.find(
            // Explicitly type nextDir
            (node) => node.name === part && (node.type === 'directory' || node.type === 'folder')
          );

          if (nextDir && nextDir.children) {
            currentDir = nextDir.children;
          } else {
            currentDir = undefined; // Directory not found
            break;
          }
        }
        return currentDir || [];
      }
    } else {
      // For media files (S3), items already represent the current directory contents
      return items;
    }
  }, [items, currentPath, type]);

  // Use the custom operations hook
  const {
    handleUpload,
    handleCreateFolder,
    handleDelete,
    handleRename,
    handleMove,
    isCreatingFile,
    isCreatingFolder,
    isDeletingFile,
    isRenamingFile,
    isMovingFile,
    isDeletingS3,
    isMovingS3
  } = useFileOperations({
    type,
    currentPath,
    fetchItems: refetch, // Pass refetch from Tanstack Query for refreshing after operations
    setIsDeleteDialogOpen, // Pass the state setter for the delete dialog
    setItemToAction // Pass the state setter for the item in action
  });

  // Local handler for item clicks
  const handleItemClick = (item: FileItem) => {
    const itemPath = getItemPath(item);

    if (item.type === 'folder' || item.type === 'directory') {
      if (type === 'files') {
        handlePathChange(itemPath);
      } else {
        // For S3, add trailing slash for folders
        handlePathChange(itemPath.endsWith('/') ? itemPath : `${itemPath}/`);
      }
    } else {
      setSelectedItem(itemPath);
      if (type === 'files') {
        // If using URL routing, the Link component in FileItemRow will handle navigation
        // Otherwise, use the callback
        if (typeof onSelect === 'function') {
          onSelect(itemPath);
        }
      } else {
        router.push(`/edit/${item.path}`);
        // For media items, always use the callback
        if (typeof onSelect === 'function') {
          onSelect(itemPath, item.path);
        }
      }
    }
  };

  // Local handler for breadcrumb navigation
  const handleBreadcrumbNavigation = (path: string) => {
    if (type === 'files') {
      handlePathChange(path);
    } else {
      // For S3, add trailing slash for folders
      const formattedPath = path ? `${path}/` : '';
      handlePathChange(formattedPath);
    }

    // Reset expanded folders when navigating to root
    if (path === '') {
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
    setIsCreateFolderDialogOpen(true);
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
    <div className={styles['file-browser']}>
      {/* Use the FileBrowserActions component */}
      <FileBrowserActions
        type={type}
        isUploading={isUploading} // Assuming isUploading is still managed locally or in useFileBrowserState
        onRefresh={() => refetch()} // Call refetch from Tanstack Query
        onNewFolderClick={handleNewFolderButtonClick} // Call local handler
        onOpenUploadDialog={handleOpenUploadDialog} // Pass the handler to open the dialog
        currentPath={currentPath} // Pass the currentPath prop
        isCreatingFolder={isCreatingFolder} // Pass loading state (This is the loading state from useFileOperations)
        fetchItems={refetch} // Pass the refetch function from useFilesQuery
      />
      <div className="px-4">
        <Breadcrumbs
          currentPath={currentPath.replace(/\/$/, '')} // Remove trailing slash for display
          onNavigate={handleBreadcrumbNavigation}
          rootIcon={<Home size={12} />}
          type={type}
        />
      </div>

      {/* Main content area with padding at the bottom to account for the action bar */}
      <div className={cn('px-4 pt-2 pb-8 overflow-y-auto max-h-[calc(100vh-180px)]')}>
        {isLoading && (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">Loading...</div>
        )}
        {error && (
          <div className="flex items-center justify-center h-20 text-destructive text-xs">
            Error loading files: {error.message}
          </div>
        )}
        {!isLoading && !error && currentDirContents.length > 0 && (
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
                isDeleting={isDeletingFile || isDeletingS3} // Pass combined loading state
                isRenaming={isRenamingFile} // Pass loading state
                isMoving={isMovingFile || isMovingS3} // Pass combined loading state
              />
            ))}
          </div>
        )}
        {!isLoading && !error && currentDirContents.length === 0 && (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">No items found</div>
        )}
      </div>

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={isCreateFolderDialogOpen}
        onOpenChange={setIsCreateFolderDialogOpen}
        onCreate={handleCreateFolder} // Pass the handleCreateFolder function directly
        isMobile={isMobile}
        isCreating={isCreatingFolder} // Pass loading state (This is the loading state from useFileOperations)
      />

      {/* Move File Dialog */}
      {itemToAction && (
        <MoveFileDialog
          open={isMoveDialogOpen}
          onOpenChange={setIsMoveDialogOpen}
          item={{
            key: getItemPath(itemToAction),
            type: itemToAction.type === 'directory' || itemToAction.type === 'folder' ? 'folder' : 'file'
          }}
          currentPath={
            type === 'files' ? getItemPath(itemToAction).split('/').slice(0, -1).join('/') + '/' : currentPath
          }
          onMove={(destinationPath) => handleMove(itemToAction, destinationPath)} // Call handleMove from operations hook
          isMarkdownFile={type === 'files'}
          isMoving={isMovingFile || isMovingS3} // Pass combined loading state
        />
      )}

      {/* Rename File Dialog */}
      {itemToAction && (
        <RenameFileDialog
          open={isRenameDialogOpen}
          onOpenChange={setIsRenameDialogOpen}
          item={{
            key: getItemPath(itemToAction),
            type: itemToAction.type === 'directory' || itemToAction.type === 'folder' ? 'folder' : 'file'
          }}
          onRename={(newName: string) => handleRename(itemToAction, newName)} // Call handleRename from operations hook
          isMarkdownFile={type === 'files'}
          isRenaming={isRenamingFile} // Pass loading state
        />
      )}

      {/* Delete Confirmation Dialog */}
      {itemToAction && (
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title={`Delete ${itemToAction.type === 'directory' || itemToAction.type === 'folder' ? 'Folder' : 'File'}`}
          description={`Are you sure you want to delete ${getItemName(itemToAction)}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDelete(itemToAction)} // Call handleDelete from operations hook
          destructive={true}
          isDeleting={isDeletingFile || isDeletingS3} // Pass combined loading state
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
