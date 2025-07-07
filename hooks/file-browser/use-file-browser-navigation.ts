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

  return {
    currentPath,
    setCurrentPath
  };
};
