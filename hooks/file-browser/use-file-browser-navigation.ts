import { useState } from 'react';

interface UseFileBrowserNavigationProps {
  selectedPath?: string;
}

export const useFileBrowserNavigation = ({ selectedPath }: UseFileBrowserNavigationProps) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (selectedPath) {
      const parts = selectedPath.split('/');
      if (selectedPath.includes('.')) {
        return parts.length === 1 ? '' : parts.slice(0, -1).join('/');
      }
      return selectedPath;
    }
    return '';
  });

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>();
    if (selectedPath) {
      const parts = selectedPath.split('/');
      let current = '';
      for (let i = 0; i < parts.length - (selectedPath.includes('.') ? 1 : 0); i++) {
        current = current ? `${current}/${parts[i]}` : parts[i];
        initialExpanded.add(current);
      }
    }
    return initialExpanded;
  });

  return {
    currentPath,
    setCurrentPath,
    expandedFolders,
    setExpandedFolders
  };
};