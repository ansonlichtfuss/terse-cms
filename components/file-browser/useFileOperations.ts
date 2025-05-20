import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query"; // Import necessary types
import { useRouter } from "next/navigation"; // Import useRouter

import { toast } from "@/components/ui/use-toast";
import { useGitStatus } from "@/context/GitStatusContext";
// Import the new file operation mutation hooks
import { useCreateFileMutation } from "@/hooks/query/useCreateFileMutation";
import { useCreateFolderMutation } from "@/hooks/query/useCreateFolderMutation";
import { useDeleteFileMutation } from "@/hooks/query/useDeleteFileMutation";
import { useMoveFileMutation } from "@/hooks/query/useMoveFileMutation";
import { useRenameFileMutation } from "@/hooks/query/useRenameFileMutation";
// Import the new S3 mutation hooks
import {
  useDeleteS3ItemMutation,
  useMoveS3ItemMutation,
} from "@/hooks/query/useS3Operations";

import type { FileItem } from "./FileBrowser"; // Assuming FileItem type remains in the main file for now
import { getItemPath } from "./utils"; // Import utility function

interface UseFileOperationsProps {
  type: "files" | "media";
  currentPath: string; // Needed for refreshing after operations
  fetchItems: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<FileItem[], Error>>; // Function to refresh the file list using Tanstack Query's refetch signature
  setIsDeleteDialogOpen: (isOpen: boolean) => void; // Function to close the delete dialog
  setItemToAction: (item: FileItem | null) => void; // Function to clear the item in action
}

interface UseFileOperationsResult {
  handleUpload: (files: FileList | null) => Promise<void>;
  handleCreateFolder: (folderName: string) => Promise<void>;
  handleDelete: (item: FileItem) => Promise<void>;
  handleRename: (item: FileItem, newName: string) => Promise<void>;
  handleMove: (item: FileItem, destinationPath: string) => Promise<void>;
  handleCreateFile: (filePath: string, content?: string) => Promise<void>;
  isCreatingFile: boolean;
  isCreatingFolder: boolean;
  isDeletingFile: boolean;
  isRenamingFile: boolean;
  isMovingFile: boolean;
  isDeletingS3: boolean;
  isMovingS3: boolean;
}

export const useFileOperations = ({
  type,
  currentPath,
  fetchItems,
  setIsDeleteDialogOpen,
  setItemToAction,
}: UseFileOperationsProps): UseFileOperationsResult => {
  const router = useRouter(); // Initialize useRouter
  const { updateGitStatus } = useGitStatus();

  // Use the S3 mutation hooks
  const { mutate: deleteS3Item, isPending: isDeletingS3 } =
    useDeleteS3ItemMutation();
  const { mutate: moveS3Item, isPending: isMovingS3 } = useMoveS3ItemMutation();

  // Use the new file operation mutation hooks
  const { mutate: createFile, isPending: isCreatingFile } =
    useCreateFileMutation();
  const { mutate: createFolder, isPending: isCreatingFolder } =
    useCreateFolderMutation();
  const { mutate: deleteFile, isPending: isDeletingFile } =
    useDeleteFileMutation();
  const { mutate: renameFile, isPending: isRenamingFile } =
    useRenameFileMutation();
  const { mutate: moveFile, isPending: isMovingFile } = useMoveFileMutation();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Assuming isUploading state is managed in the main component or a separate state hook
    // setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("path", currentPath);
      formData.append("file", files[0]);

      const response = await fetch("/api/s3/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      // Refresh the list using Tanstack Query's refetch
      await fetchItems();
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      // setIsUploading(false);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    if (!folderName.trim()) return;

    if (type === "media") {
      // Use the S3 mutation hook for media folder creation
      // Assuming a useCreateS3FolderMutation exists or create one
      // For now, keeping the fetch call as the mutation hook was a placeholder
      try {
        const response = await fetch("/api/s3/folder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: currentPath,
            name: folderName,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create folder");
        }
        await fetchItems(); // Refresh after S3 folder creation
        toast({
          title: "Success",
          description: "Folder created successfully",
        });
      } catch (error) {
        console.error("Failed to create folder:", error);
        toast({
          title: "Error",
          description: "Failed to create folder",
          variant: "destructive",
        });
      }
    } else {
      // Use the file system mutation hook for folder creation
      createFolder(
        { path: currentPath, name: folderName },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Folder created successfully",
            });
          },
          onError: (error) => {
            console.error("Failed to create folder:", error);
            toast({
              title: "Error",
              description: "Failed to create folder",
              variant: "destructive",
            });
          },
        },
      );
    }
  };

  const handleDelete = async (item: FileItem) => {
    try {
      if (type === "files") {
        // Use the file system mutation hook for file deletion
        deleteFile(
          { path: getItemPath(item) },
          {
            onSuccess: () => {
              // Close the dialog and clear the item in action
              setIsDeleteDialogOpen(false);
              setItemToAction(null);
              toast({
                title: "Success",
                description: `${
                  item.type === "directory" || item.type === "folder"
                    ? "Folder"
                    : "File"
                } deleted successfully`,
              });
            },
            onError: (error) => {
              console.error("Failed to delete item:", error);
              toast({
                title: "Error",
                description: "Failed to delete item",
                variant: "destructive",
              });
            },
          },
        );
      } else {
        // Use the S3 mutation hook for media deletion
        deleteS3Item(
          { key: item.key, type: item.type },
          {
            onSuccess: () => {
              // Close the dialog and clear the item in action
              setIsDeleteDialogOpen(false);
              setItemToAction(null);
              toast({
                title: "Success",
                description: `${
                  item.type === "directory" || item.type === "folder"
                    ? "Folder"
                    : "File"
                } deleted successfully`,
              });
            },
            onError: (error) => {
              console.error("Failed to delete item:", error);
              toast({
                title: "Error",
                description: "Failed to delete item",
                variant: "destructive",
              });
            },
          },
        );
      }
    } catch (error) {
      console.error("Failed to initiate delete operation:", error);
      toast({
        title: "Error",
        description: "Failed to initiate delete operation",
        variant: "destructive",
      });
    }
  };

  const handleRename = async (item: FileItem, newName: string) => {
    if (!newName.trim()) return;

    if (type === "files") {
      // Use the file system mutation hook for file renaming
      renameFile(
        {
          sourcePath: getItemPath(item),
          newName,
          type: item.type === "directory" ? "directory" : "file",
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: `${
                item.type === "directory" || item.type === "folder"
                  ? "Folder"
                  : "File"
              } renamed successfully`,
            });
            // Construct the new path and navigate
            const sourcePath = getItemPath(item);
            const sourceParts = sourcePath.split("/");
            sourceParts[sourceParts.length - 1] = newName;
            const newPath = sourceParts.join("/");
            router.push(`/edit/${newPath}`);
          },
          onError: (error) => {
            console.error("Failed to rename item:", error);
            toast({
              title: "Error",
              description: `Failed to rename item: ${
                error instanceof Error ? error.message : String(error)
              }`,
              variant: "destructive",
            });
          },
        },
      );
    } else {
      // For media, implement rename API call or mutation
      // This would need to be implemented in the backend
      toast({
        title: "Not implemented",
        description: "Rename for media is not implemented yet",
      });
    }
  };

  const handleMove = async (item: FileItem, destinationPath: string) => {
    if (!destinationPath.trim()) return;

    try {
      if (type === "files") {
        // Use the file system mutation hook for file move
        moveFile(
          {
            sourcePath: getItemPath(item),
            destinationPath,
            type: item.type === "directory" ? "directory" : "file",
          },
          {
            onSuccess: () => {
              toast({
                title: "Success",
                description: `${
                  item.type === "directory" || item.type === "folder"
                    ? "Folder"
                    : "File"
                } moved successfully`,
              });
              // Assuming state updates for dialog closing are handled elsewhere
              // setIsMoveDialogOpen(false);
              // setItemToAction(null);
            },
            onError: (error) => {
              console.error("Failed to move item:", error);
              toast({
                title: "Error",
                description: "Failed to move item",
                variant: "destructive",
              });
            },
          },
        );
      } else {
        // Use the S3 mutation hook for media move
        moveS3Item(
          { sourceKey: item.key, destinationPath, type: item.type },
          {
            onSuccess: () => {
              toast({
                title: "Success",
                description: `${
                  item.type === "directory" || item.type === "folder"
                    ? "Folder"
                    : "File"
                } moved successfully`,
              });
              // Assuming state updates for dialog closing are handled elsewhere
              // setIsMoveDialogOpen(false);
              // setItemToAction(null);
            },
            onError: (error) => {
              console.error("Failed to move item:", error);
              toast({
                title: "Error",
                description: "Failed to move item",
                variant: "destructive",
              });
            },
          },
        );
      }
    } catch (error) {
      console.error("Failed to initiate move operation:", error);
      toast({
        title: "Error",
        description: "Failed to initiate move operation",
        variant: "destructive",
      });
    }
  };

  const handleCreateFile = async (filePath: string, content: string = "") => {
    // Use the file system mutation hook for file creation
    createFile(
      { filePath, content },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "File created successfully",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to create file",
            variant: "destructive",
          });
          // Re-throw to allow calling component to handle errors
          throw error;
        },
      },
    );
  };

  return {
    handleUpload,
    handleCreateFolder,
    handleDelete,
    handleRename,
    handleMove,
    handleCreateFile,
    isCreatingFile,
    isCreatingFolder,
    isDeletingFile,
    isRenamingFile,
    isMovingFile,
    isDeletingS3,
    isMovingS3,
  };
};
