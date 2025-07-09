import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { toast } from '@/components/ui/use-toast';
import { useQueryInvalidation } from '@/hooks/api/shared';
// Import the new file operation mutation hooks
import { useCreateFileMutation } from '@/hooks/api/use-create-file-mutation';
import { useCreateFolderMutation } from '@/hooks/api/use-create-folder-mutation';
import { useCreateS3FolderMutation } from '@/hooks/api/use-create-s3-folder-mutation';
import { useDeleteFileMutation } from '@/hooks/api/use-delete-file-mutation';
import { useMoveFileMutation } from '@/hooks/api/use-move-file-mutation';
import { useRenameFileMutation } from '@/hooks/api/use-rename-file-mutation';
// Import the new S3 mutation hooks
import { useDeleteS3ItemMutation, useMoveS3ItemMutation } from '@/hooks/api/use-s3-operations';
import { useRepositoryFromUrl } from '@/hooks/use-repository-from-url';

import type { FileItem } from '../file-browser'; // Assuming FileItem type remains in the main file for now
import { getItemPath } from '../utils'; // Import utility function

interface UseFileOperationsProps {
  type: 'files' | 'media';
  currentPath: string; // Needed for refreshing after operations
  fetchItems?: (options?: RefetchOptions) => Promise<QueryObserverResult<FileItem[], Error>>; // Function to refresh the file list using Tanstack Query's refetch signature
  deleteDialog: {
    isOpen: boolean;
    item: FileItem | null;
    openDialog: (item?: FileItem) => void;
    closeDialog: () => void;
  }; // Delete dialog object
}

interface UseFileOperationsResult {
  handleCreateFolder: (folderName: string) => Promise<void>;
  handleDelete: (item: FileItem) => Promise<void>;
  handleRename: (item: FileItem, newName: string) => Promise<void>;
  handleMove: (item: FileItem, destinationPath: string) => Promise<void>;
  handleCreateFile: (filePath: string, content?: string) => Promise<void>;
  isCreatingFolder: boolean;
  isDeletingFile: boolean;
  isRenamingFile: boolean;
  isMovingFile: boolean;
  isDeletingS3: boolean;
  isMovingS3: boolean;
  isCreatingS3Folder: boolean;
}

export const useFileOperations = ({
  type,
  currentPath,
  fetchItems: _fetchItems,
  deleteDialog
}: UseFileOperationsProps): UseFileOperationsResult => {
  const router = useRouter();
  const { currentRepositoryId } = useRepositoryFromUrl();
  const { invalidateFileQueries, invalidateGitQueries } = useQueryInvalidation();

  // Use the S3 mutation hooks
  const { mutate: deleteS3Item, isPending: isDeletingS3 } = useDeleteS3ItemMutation();
  const { mutate: moveS3Item, isPending: isMovingS3 } = useMoveS3ItemMutation();
  const { mutate: createS3Folder, isPending: isCreatingS3Folder } = useCreateS3FolderMutation();

  // Use the new file operation mutation hooks
  const { mutate: createFile } = useCreateFileMutation();
  const { mutate: createFolder, isPending: isCreatingFolder } = useCreateFolderMutation();
  const { mutate: deleteFile, isPending: isDeletingFile } = useDeleteFileMutation();
  const { mutate: renameFile, isPending: isRenamingFile } = useRenameFileMutation();
  const { mutate: moveFile, isPending: isMovingFile } = useMoveFileMutation();

  const handleCreateFolder = async (folderName: string) => {
    if (!folderName.trim()) return;

    if (type === 'media') {
      // Use the S3 mutation hook for media folder creation
      createS3Folder(
        { path: currentPath, name: folderName },
        {
          onSuccess: () => {
            toast({
              title: 'Folder created'
            });
          },
          onError: (error) => {
            console.error('Failed to create folder:', error);
            toast({
              title: 'Failed to create folder',
              variant: 'destructive'
            });
          }
        }
      );
    } else {
      // Use the file system mutation hook for folder creation
      createFolder(
        { path: currentPath, name: folderName },
        {
          onSuccess: () => {
            toast({
              title: 'Folder created'
            });
          },
          onError: (error) => {
            console.error('Failed to create folder:', error);
            toast({
              title: 'Failed to create folder',
              variant: 'destructive'
            });
          }
        }
      );
    }
  };

  const handleDelete = async (item: FileItem) => {
    try {
      if (type === 'files') {
        // Use the file system mutation hook for file deletion
        deleteFile(
          { path: getItemPath(item) },
          {
            onSuccess: () => {
              // Close the dialog
              deleteDialog.closeDialog();
              toast({
                title: `${item.type === 'directory' || item.type === 'folder' ? 'Folder' : 'File'} deleted`
              });
            },
            onError: (error) => {
              console.error('Failed to delete item:', error);
              toast({
                title: 'Failed to delete item',
                variant: 'destructive'
              });
            }
          }
        );
      } else {
        // Use the S3 mutation hook for media deletion
        deleteS3Item(
          { key: item.key, type: item.type },
          {
            onSuccess: () => {
              // Close the dialog
              deleteDialog.closeDialog();
              toast({
                title: `${item.type === 'directory' || item.type === 'folder' ? 'Folder' : 'File'} deleted`
              });
            },
            onError: (error) => {
              console.error('Failed to delete item:', error);
              toast({
                title: 'Failed to delete item',
                variant: 'destructive'
              });
            }
          }
        );
      }
    } catch (error) {
      console.error('Failed to initiate delete operation:', error);
      toast({
        title: 'Failed to initiate delete operation',
        variant: 'destructive'
      });
    }
  };

  const handleRename = async (item: FileItem, newName: string) => {
    if (!newName.trim()) return;

    if (type === 'files') {
      // Use the file system mutation hook for file renaming
      renameFile(
        {
          sourcePath: getItemPath(item),
          newName,
          type: item.type === 'directory' ? 'directory' : 'file'
        },
        {
          onSuccess: () => {
            toast({
              title: `${item.type === 'directory' || item.type === 'folder' ? 'Folder' : 'File'} renamed`
            });

            invalidateFileQueries();
            invalidateGitQueries();

            // Construct the new path and navigate
            const sourcePath = getItemPath(item);
            const sourceParts = sourcePath.split('/');
            sourceParts[sourceParts.length - 1] = newName;
            const newPath = sourceParts.join('/');
            router.push(`/edit/${newPath}?repo=${currentRepositoryId}`);
          },
          onError: (error) => {
            console.error('Failed to rename item:', error);
            toast({
              title: `Failed to rename item: ${error instanceof Error ? error.message : String(error)}`,
              variant: 'destructive'
            });
          }
        }
      );
    } else {
      // For media, implement rename API call or mutation
      // This would need to be implemented in the backend
      toast({
        title: 'Rename for media is not implemented yet'
      });
    }
  };

  const handleMove = async (item: FileItem, destinationPath: string) => {
    if (!destinationPath.trim()) return;

    try {
      if (type === 'files') {
        // Use the file system mutation hook for file move
        moveFile(
          {
            sourcePath: getItemPath(item),
            destinationPath,
            type: item.type === 'directory' ? 'directory' : 'file'
          },
          {
            onSuccess: () => {
              toast({
                title: `${item.type === 'directory' || item.type === 'folder' ? 'Folder' : 'File'} moved`
              });
            },
            onError: (error) => {
              console.error('Failed to move item:', error);
              toast({
                title: 'Failed to move item',
                variant: 'destructive'
              });
            }
          }
        );
      } else {
        // Use the S3 mutation hook for media move
        moveS3Item(
          { sourceKey: item.key, destinationPath, type: item.type },
          {
            onSuccess: () => {
              toast({
                title: `${item.type === 'directory' || item.type === 'folder' ? 'Folder' : 'File'} moved`
              });
            },
            onError: (error) => {
              console.error('Failed to move item:', error);
              toast({
                title: 'Failed to move item',
                variant: 'destructive'
              });
            }
          }
        );
      }
    } catch (error) {
      console.error('Failed to initiate move operation:', error);
      toast({
        title: 'Failed to initiate move operation',
        variant: 'destructive'
      });
    }
  };

  const handleCreateFile = async (filePath: string, content: string = '') => {
    // Use the file system mutation hook for file creation
    createFile(
      { filePath, content },
      {
        onSuccess: () => {
          toast({
            title: 'File created'
          });
          invalidateFileQueries();
        },
        onError: (error) => {
          toast({
            title: 'Failed to create file',
            variant: 'destructive'
          });
          // Re-throw to allow calling component to handle errors
          throw error;
        }
      }
    );
  };

  return {
    handleCreateFolder,
    handleDelete,
    handleRename,
    handleMove,
    handleCreateFile,
    isCreatingFolder,
    isDeletingFile,
    isRenamingFile,
    isMovingFile,
    isDeletingS3,
    isMovingS3,
    isCreatingS3Folder
  };
};
