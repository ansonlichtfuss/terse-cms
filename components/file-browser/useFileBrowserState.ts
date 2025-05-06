import { useState, useEffect } from "react";

interface UseFileBrowserStateProps {
  isMobile?: boolean;
  inSidebar?: boolean;
  selectedPath?: string;
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
  const [currentPath, setCurrentPath] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
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
