'use client';

import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs/breadcrumbs';
import { MoveFileDialog } from '@/components/file-browser/move-file-dialog';
import { RenameFileDialog } from '@/components/rename-file-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useFilesQuery } from '@/hooks/api/use-files-query';
import { useFileBrowserNavigation } from '@/hooks/file-browser/use-file-browser-navigation';
import { useFileBrowserSorting } from '@/hooks/file-browser/use-file-browser-sorting';
import { useFileSelection } from '@/hooks/file-browser/use-file-selection';
import { useDialogState } from '@/hooks/ui/use-dialog-state';
import { useRepositoryFromUrl } from '@/hooks/use-repository-from-url';
import { cn } from '@/lib/utils';

import { ScrollableContainer } from '../ui/scrollable-container';
import { CreateFolderDialog } from './create-folder-dialog';
import { FileBrowserActions } from './file-browser-actions';
import { FileItemRow } from './file-item-row';
import { useFileOperations } from './hooks/use-file-operations';
import { useSort } from './hooks/use-sort';
import type { FileItem } from './types/file-item';
import UploadDialog from './upload-dialog';
import { getItemName, getItemPath } from './utils';
export type { FileItem } from './types/file-item';

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
  const moveDialog = useDialogState<FileItem>();
  const renameDialog = useDialogState<FileItem>();
  const deleteDialog = useDialogState<FileItem>();
  const createFolderDialog = useDialogState();

  const { selectedItem, setSelectedItem } = useFileSelection({ selectedPath });
  const { currentPath, setCurrentPath } = useFileBrowserNavigation({
    selectedPath
  });
  const { sortConfig, updateSort } = useFileBrowserSorting({ type });

  // Create a handler that calls both setCurrentPath and onPathChange
  const handlePathChange = (path: string) => {
    setCurrentPath(path);
    if (onPathChange) {
      onPathChange(path, type); // Pass the type along with the path
    }
  };

  const router = useRouter();
  const { currentRepositoryId } = useRepositoryFromUrl();

  // Add state for the upload dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading] = useState(isMobile);

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

  // Use sort hook
  const { sortedItems } = useSort({
    items: currentDirContents,
    sortConfig,
    onSortChange: updateSort
  });

  // Update currentDirContents to use sorted items
  const displayItems = React.useMemo(() => {
    return sortedItems;
  }, [sortedItems]);

  // Use the custom operations hook
  const {
    handleCreateFolder,
    handleDelete,
    handleRename,
    handleMove,
    isCreatingFolder,
    isDeletingFile,
    isRenamingFile,
    isMovingFile,
    isDeletingS3,
    isMovingS3,
    isCreatingS3Folder
  } = useFileOperations({
    type,
    currentPath,
    fetchItems: refetch, // Pass refetch from Tanstack Query for refreshing after operations
    deleteDialog // Pass the delete dialog object
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
        const href = currentRepositoryId ? `/edit/${item.path}?repo=${currentRepositoryId}` : `/edit/${item.path}`;
        router.push(href);
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
  };
  // Local handler to open delete dialog
  const openDeleteDialog = (item: FileItem) => {
    deleteDialog.openDialog(item);
  };

  // Local handler to open rename dialog
  const openRenameDialog = (item: FileItem) => {
    renameDialog.openDialog(item);
  };

  // Local handler to open move dialog
  const openMoveDialog = (item: FileItem) => {
    moveDialog.openDialog(item);
  };

  // Local handler for create folder button click
  const handleNewFolderButtonClick = () => {
    createFolderDialog.openDialog();
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
    <div className="flex flex-col h-full">
      {/* Use the FileBrowserActions component */}
      <FileBrowserActions
        type={type}
        isUploading={isUploading} // Assuming isUploading is still managed locally or in useFileBrowserState
        onRefresh={() => refetch()} // Call refetch from Tanstack Query
        onNewFolderClick={handleNewFolderButtonClick} // Call local handler
        onOpenUploadDialog={handleOpenUploadDialog} // Pass the handler to open the dialog
        currentPath={currentPath} // Pass the currentPath prop
        isCreatingFolder={isCreatingFolder || isCreatingS3Folder} // Pass loading state for both file system and S3 folder creation
        fetchItems={refetch} // Pass the refetch function from useFilesQuery
        sortConfig={sortConfig}
        onSortChange={updateSort}
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
      <ScrollableContainer
        direction="vertical"
        gradientSize={64}
        dependencies={[currentPath]}
        className={cn('mx-4 pt-2 overflow-y-auto h-full')}
      >
        <div className={cn('space-y-1 pb-20 max-h-0')}>
          {isLoading && (
            <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">Loading...</div>
          )}
          {error && (
            <div className="flex items-center justify-center h-20 text-destructive text-xs">
              Error loading files: {error.message}
            </div>
          )}
          {!isLoading &&
            !error &&
            displayItems.length > 0 &&
            displayItems.map((item) => (
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
          {!isLoading && !error && displayItems.length === 0 && (
            <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">No items found</div>
          )}
          <div className="h-3"></div>
        </div>
      </ScrollableContainer>

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={createFolderDialog.isOpen}
        onOpenChange={(open) => (open ? createFolderDialog.openDialog() : createFolderDialog.closeDialog())}
        onCreate={handleCreateFolder} // Pass the handleCreateFolder function directly
        isMobile={isMobile}
        isCreating={isCreatingFolder || isCreatingS3Folder} // Pass loading state for both file system and S3 folder creation
      />

      {/* Move File Dialog */}
      {moveDialog.item && (
        <MoveFileDialog
          open={moveDialog.isOpen}
          onOpenChange={(open) => (open ? moveDialog.openDialog() : moveDialog.closeDialog())}
          item={{
            key: getItemPath(moveDialog.item),
            type: moveDialog.item.type === 'directory' || moveDialog.item.type === 'folder' ? 'folder' : 'file'
          }}
          currentPath={
            type === 'files' ? getItemPath(moveDialog.item).split('/').slice(0, -1).join('/') + '/' : currentPath
          }
          onMove={(destinationPath) => moveDialog.item && handleMove(moveDialog.item, destinationPath)} // Call handleMove from operations hook
          isMarkdownFile={type === 'files'}
          isMoving={isMovingFile || isMovingS3} // Pass combined loading state
        />
      )}

      {/* Rename File Dialog */}
      {renameDialog.item && (
        <RenameFileDialog
          open={renameDialog.isOpen}
          onOpenChange={(open) => (open ? renameDialog.openDialog() : renameDialog.closeDialog())}
          item={{
            key: getItemPath(renameDialog.item),
            type: renameDialog.item.type === 'directory' || renameDialog.item.type === 'folder' ? 'folder' : 'file'
          }}
          onRename={(newName: string) => renameDialog.item && handleRename(renameDialog.item, newName)} // Call handleRename from operations hook
          isMarkdownFile={type === 'files'}
          isRenaming={isRenamingFile} // Pass loading state
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.item && (
        <ConfirmationDialog
          open={deleteDialog.isOpen}
          onOpenChange={(open) => (open ? deleteDialog.openDialog() : deleteDialog.closeDialog())}
          title={`Delete ${deleteDialog.item.type === 'directory' || deleteDialog.item.type === 'folder' ? 'Folder' : 'File'}`}
          description={`Are you sure you want to delete ${getItemName(deleteDialog.item)}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => deleteDialog.item && handleDelete(deleteDialog.item)} // Call handleDelete from operations hook
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
