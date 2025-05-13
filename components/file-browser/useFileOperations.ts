import { toast } from "@/components/ui/use-toast";
import type { FileItem } from "./FileBrowser"; // Assuming FileItem type remains in the main file for now
import { getItemPath } from "./utils"; // Import utility function
import { useRouter } from "next/navigation"; // Import useRouter

interface UseFileOperationsProps {
  type: "files" | "media";
  currentPath: string; // Needed for refreshing after operations
  fetchItems: (path: string) => Promise<void>; // Function to refresh the file list
  setIsDeleteDialogOpen: (isOpen: boolean) => void; // Function to close the delete dialog
  setItemToAction: (item: FileItem | null) => void; // Function to clear the item in action
}

interface UseFileOperationsResult {
  handleUpload: (files: FileList | null) => Promise<void>;
  handleCreateFolder: (folderName: string) => Promise<void>;
  handleDelete: (item: FileItem) => Promise<void>;
  handleRename: (item: FileItem, newName: string) => Promise<void>;
  handleMove: (item: FileItem, destinationPath: string) => Promise<void>;
  handleCreateFile: (filePath: string, content?: string) => Promise<void>; // Add handleCreateFile here
}

export const useFileOperations = ({
  type,
  currentPath,
  fetchItems,
  setIsDeleteDialogOpen,
  setItemToAction,
}: UseFileOperationsProps): UseFileOperationsResult => {
  const router = useRouter(); // Initialize useRouter

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

      // Refresh the list
      await fetchItems(currentPath);
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

    try {
      if (type === "media") {
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
      } else {
        // For files, implement folder creation API call
        // This would need to be implemented in the backend
        toast({
          title: "Not implemented",
          description: "Folder creation for files is not implemented yet",
        });
        return; // Exit if not implemented
      }

      // Refresh the list
      await fetchItems(currentPath);
      // Assuming state updates for dialog closing are handled elsewhere
      // setIsCreatingFolder(false);
      // setNewFolderName("");
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
  };

  const handleDelete = async (item: FileItem) => {
    try {
      if (type === "files") {
        const response = await fetch("/api/files", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: getItemPath(item) }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete file");
        }
      } else {
        const response = await fetch("/api/s3", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: item.key,
            type: item.type,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete item");
        }
      }

      // Refresh the list
      await fetchItems(currentPath);

      // Close the dialog and clear the item in action
      setIsDeleteDialogOpen(false);
      setItemToAction(null);
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleRename = async (item: FileItem, newName: string) => {
    if (!newName.trim()) return;
    try {
      if (type === "files") {
        const response = await fetch("/api/files/operations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "rename",
            sourcePath: getItemPath(item),
            newName,
            type: item.type === "directory" ? "directory" : "file",
          }),
        });

        if (!response.ok) {
          toast({
            title: "Error",
            description: `Failed to rename item.`,
            variant: "destructive",
          });
          throw new Error("Failed to rename file");
        }
      } else {
        // For media, implement rename API call
        // This would need to be implemented in the backend
        toast({
          title: "Not implemented",
          description: "Rename for media is not implemented yet",
        });
        return; // Exit if not implemented
      }

      // Construct the new path
      const sourcePath = getItemPath(item);
      const sourceParts = sourcePath.split("/");
      sourceParts[sourceParts.length - 1] = newName;
      const newPath = sourceParts.join("/");

      // Navigate to the new URL
      router.push(`/edit/${newPath}`);
    } catch (error) {
      console.error("Failed to rename item:", error);
      toast({
        title: "Error",
        description: `Failed to rename item: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    }
  };

  const handleMove = async (item: FileItem, destinationPath: string) => {
    if (!destinationPath.trim()) return;

    try {
      if (type === "files") {
        const response = await fetch("/api/files/operations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "move",
            sourcePath: getItemPath(item),
            destinationPath,
            type: item.type === "directory" ? "directory" : "file",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to move file");
        }
      } else {
        // For media, implement move API call
        // This would need to be implemented in the backend
        toast({
          title: "Not implemented",
          description: "Move for media is not implemented yet",
        });
        return; // Exit if not implemented
      }

      // Refresh the list
      await fetchItems(currentPath);
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
    } catch (error) {
      console.error("Failed to move item:", error);
      toast({
        title: "Error",
        description: "Failed to move item",
        variant: "destructive",
      });
    }
  };

  const handleCreateFile = async (filePath: string, content: string = "") => {
    try {
      const response = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: filePath, content }),
      });

      if (!response.ok) {
        throw new Error("Failed to create file");
      }

      // Refresh the list
      await fetchItems(currentPath);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create file",
        variant: "destructive",
      });
      throw error; // Re-throw to allow calling component to handle errors
    }
  };

  return {
    handleUpload,
    handleCreateFolder,
    handleDelete,
    handleRename,
    handleMove,
    handleCreateFile, // Add the new function here
  };
};
