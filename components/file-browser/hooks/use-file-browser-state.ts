import { useFileBrowserNavigation } from '@/hooks/file-browser/use-file-browser-navigation';
import { useFileBrowserSorting } from '@/hooks/file-browser/use-file-browser-sorting';
import { useFileSelection } from '@/hooks/file-browser/use-file-selection';
import { useDialogState } from '@/hooks/ui/use-dialog-state';

import type { FileItem } from '../types/file-item';
import type { SortConfig } from '../types/sorting';

interface UseFileBrowserStateProps {
  selectedPath?: string;
  type?: 'files' | 'media';
}

interface UseFileBrowserStateResult {
  // File selection
  selectedItem: string | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<string | null>>;

  // Navigation
  currentPath: string;
  setCurrentPath: React.Dispatch<React.SetStateAction<string>>;
  expandedFolders: Set<string>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;

  // Sorting
  sortConfig: SortConfig;
  updateSort: (config: SortConfig) => void;

  // Dialogs
  moveDialog: {
    isOpen: boolean;
    item: FileItem | null;
    openDialog: (item?: FileItem) => void;
    closeDialog: () => void;
  };
  renameDialog: {
    isOpen: boolean;
    item: FileItem | null;
    openDialog: (item?: FileItem) => void;
    closeDialog: () => void;
  };
  deleteDialog: {
    isOpen: boolean;
    item: FileItem | null;
    openDialog: (item?: FileItem) => void;
    closeDialog: () => void;
  };
  createFolderDialog: {
    isOpen: boolean;
    item: unknown | null;
    openDialog: (item?: unknown) => void;
    closeDialog: () => void;
  };
}

export const useFileBrowserState = ({
  selectedPath,
  type = 'files'
}: UseFileBrowserStateProps): UseFileBrowserStateResult => {
  // Use focused hooks
  const fileSelection = useFileSelection({ selectedPath });
  const navigation = useFileBrowserNavigation({ selectedPath });
  const sorting = useFileBrowserSorting({ type });

  // Dialog states using generic hook
  const moveDialog = useDialogState<FileItem>();
  const renameDialog = useDialogState<FileItem>();
  const deleteDialog = useDialogState<FileItem>();
  const createFolderDialog = useDialogState();

  return {
    // File selection
    selectedItem: fileSelection.selectedItem,
    setSelectedItem: fileSelection.setSelectedItem,

    // Navigation
    currentPath: navigation.currentPath,
    setCurrentPath: navigation.setCurrentPath,
    expandedFolders: navigation.expandedFolders,
    setExpandedFolders: navigation.setExpandedFolders,

    // Sorting
    sortConfig: sorting.sortConfig,
    updateSort: sorting.updateSort,

    // Dialogs
    moveDialog,
    renameDialog,
    deleteDialog,
    createFolderDialog
  };
};
