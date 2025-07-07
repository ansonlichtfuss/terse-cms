import { useEffect, useState } from 'react';

import type { FileItem } from '../types/file-item';
import type { SortConfig, SortPreferences } from '../types/sorting';
import {
  getSortConfigForType,
  loadSortPreferences,
  saveSortPreferences,
  updateSortPreferences
} from '../utils/persistence';

interface UseFileBrowserStateProps {
  isMobile?: boolean;
  inSidebar?: boolean;
  selectedPath?: string; // Keep selectedPath
  type?: 'files' | 'media';
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
  itemToAction: FileItem | null;
  setItemToAction: React.Dispatch<React.SetStateAction<FileItem | null>>;
  currentPath: string;
  setCurrentPath: React.Dispatch<React.SetStateAction<string>>;
  expandedFolders: Set<string>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  newFolderName: string;
  setNewFolderName: React.Dispatch<React.SetStateAction<string>>;
  isCreateFolderDialogOpen: boolean;
  setIsCreateFolderDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mounted: boolean;
  // Sorting-related state
  sortConfig: SortConfig;
  setSortConfig: React.Dispatch<React.SetStateAction<SortConfig>>;
  sortPreferences: SortPreferences;
  updateSort: (config: SortConfig) => void;
}

export const useFileBrowserState = ({
  isMobile = false,
  selectedPath,
  type = 'files'
}: UseFileBrowserStateProps): UseFileBrowserStateResult => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToAction, setItemToAction] = useState<FileItem | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // Initialize currentPath based on selectedPath
    if (selectedPath) {
      const parts = selectedPath.split('/');
      // If it's a file (contains a dot)
      if (selectedPath.includes('.')) {
        // If it's a file at the root, set currentPath to ""
        if (parts.length === 1) {
          return '';
        }
        // If it's a file in a subdirectory, set currentPath to its directory
        return parts.slice(0, -1).join('/');
      }
      // If it's a folder or root, use the path itself
      return selectedPath;
    }
    return ''; // Default to root
  });
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    // Initialize expandedFolders based on selectedPath
    const initialExpanded = new Set<string>();
    if (selectedPath) {
      const parts = selectedPath.split('/');
      let current = '';
      // Add all parent directories to expandedFolders
      for (let i = 0; i < parts.length - (selectedPath.includes('.') ? 1 : 0); i++) {
        current = current ? `${current}/${parts[i]}` : parts[i];
        initialExpanded.add(current);
      }
    }
    return initialExpanded;
  });
  const [isUploading, setIsUploading] = useState(isMobile);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sorting state
  const [sortPreferences, setSortPreferences] = useState<SortPreferences>(() => {
    // Load saved preferences on initialization
    return loadSortPreferences();
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    // Initialize with the appropriate config for the current type
    const preferences = loadSortPreferences();
    return getSortConfigForType(preferences, type);
  });

  // Update sort config when type changes
  useEffect(() => {
    const newConfig = getSortConfigForType(sortPreferences, type);
    setSortConfig(newConfig);
  }, [type, sortPreferences]);

  // Function to update sort configuration and persist preferences
  const updateSort = (config: SortConfig) => {
    setSortConfig(config);
    const updatedPreferences = updateSortPreferences(sortPreferences, type, config);
    setSortPreferences(updatedPreferences);
    saveSortPreferences(updatedPreferences);
  };

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
    newFolderName,
    setNewFolderName,
    isCreateFolderDialogOpen,
    setIsCreateFolderDialogOpen,
    mounted,
    // Sorting properties
    sortConfig,
    setSortConfig,
    sortPreferences,
    updateSort
  };
};
