import { useEffect, useState } from "react";

import { toast } from "@/components/ui/use-toast";

import type { FileItem } from "./FileBrowser"; // Assuming FileItem type remains in the main file for now
import { fileNodeToFileItem } from "./utils"; // Import the utility function

interface UseFileFetchingProps {
  currentPath: string;
  type: "files" | "media";
}

interface UseFileFetchingResult {
  items: FileItem[];
  currentDirContents: FileItem[];
  isLoading: boolean;
  fetchItems: (path: string) => Promise<void>; // Expose fetchItems for manual refresh
}

export const useFileFetching = ({
  currentPath,
  type,
}: UseFileFetchingProps): UseFileFetchingResult => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [currentDirContents, setCurrentDirContents] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async (path: string) => {
    setIsLoading(true);
    try {
      if (type === "files") {
        const response = await fetch("/api/files/tree");
        const data = await response.json();

        // Convert file tree to flat structure for current directory
        const files = data.files || [];

        if (path === "") {
          // At root level, show all top-level files and directories
          setCurrentDirContents(files.map(fileNodeToFileItem));
        } else {
          // Find the directory node that matches the current path
          const pathParts = path.split("/").filter(Boolean);
          let currentDir = files;
          let found = false;

          // Navigate through the path parts to find the current directory
          for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            const nextDir = currentDir.find(
              (node: FileItem) =>
                node.name === part && node.type === "directory",
            );

            if (nextDir && nextDir.children) {
              currentDir = nextDir.children;
              found = true;
            } else {
              found = false;
              break;
            }
          }

          if (found) {
            setCurrentDirContents(currentDir.map(fileNodeToFileItem));
          } else {
            // If directory not found, reset to root
            // This logic might need refinement depending on desired behavior
            console.warn(`Directory not found: ${path}. Resetting to root.`);
            // setCurrentPath(""); // This should be handled by the state hook
            setCurrentDirContents(files.map(fileNodeToFileItem));
          }
        }

        setItems(files.map(fileNodeToFileItem));
      } else {
        // For media files (S3)
        const response = await fetch(
          `/api/s3?path=${encodeURIComponent(path)}`,
        );
        const data = await response.json();
        setItems(data.items || []);
        setCurrentDirContents(data.items || []);
      }
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to fetch ${type}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(currentPath);
  }, [currentPath, type]); // Depend on currentPath and type

  return {
    items,
    currentDirContents,
    isLoading,
    fetchItems,
  };
};
