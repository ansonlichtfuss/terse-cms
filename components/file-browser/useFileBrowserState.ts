import { useState, useEffect } from "react";

interface UseFileBrowserStateProps {
  isMobile?: boolean;
  inSidebar?: boolean;
  selectedPath?: string; // Keep selectedPath
}

interface UseFileBrowserStateResult {
  selectedItem: string | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<string | null>>;
  isMoveDialogOpen: boolean;
  setIsMoveDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isRenameDialogOpen: boolean;
  setIsRenameDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  itemToAction: any | null; // TODO: Define a more specific type for itemToAction
  setItemToAction: React.Dispatch<React.SetStateAction<any | null>>; // TODO: Define a more specific type for itemToAction
  currentPath: string;
  setCurrentPath: React.Dispatch<React.SetStateAction<string>>;
  expandedFolders: Set<string>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  isCreatingFolder: boolean;
  setIsCreatingFolder: React.Dispatch<React.SetStateAction<boolean>>;
  newFolderName: string;
  setNewFolderName: React.Dispatch<React.SetStateAction<string>>;
  mounted: boolean;
}

export const useFileBrowserState = ({
  isMobile = false,
  inSidebar = false,
  selectedPath,
}: UseFileBrowserStateProps): UseFileBrowserStateResult => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToAction, setItemToAction] = useState<any | null>(null); // TODO: Define a more specific type
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // Initialize currentPath based on selectedPath
    if (selectedPath) {
      const parts = selectedPath.split("/");
      // If it's a file, set currentPath to its directory
      if (parts.length > 1 && selectedPath.includes(".")) {
        return parts.slice(0, -1).join("/");
      }
      // If it's a folder or root, use the path itself
      return selectedPath;
    }
    return ""; // Default to root
  });
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    // Initialize expandedFolders based on selectedPath
    const initialExpanded = new Set<string>();
    if (selectedPath) {
      const parts = selectedPath.split("/");
      let current = "";
      // Add all parent directories to expandedFolders
      for (
        let i = 0;
        i < parts.length - (selectedPath.includes(".") ? 1 : 0);
        i++
      ) {
        current = current ? `${current}/${parts[i]}` : parts[i];
        initialExpanded.add(current);
      }
    }
    return initialExpanded;
  });
  const [isUploading, setIsUploading] = useState(isMobile);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedPath) {
      setSelectedItem(selectedPath);
    }
  }, [selectedPath]);

  // Removed the useEffect that updates URL query parameters

  return {
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
  };
};
