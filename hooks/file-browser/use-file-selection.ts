import { useEffect, useState } from 'react';

interface UseFileSelectionProps {
  selectedPath?: string;
}

export const useFileSelection = ({ selectedPath }: UseFileSelectionProps) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPath) {
      setSelectedItem(selectedPath);
    }
  }, [selectedPath]);

  return {
    selectedItem,
    setSelectedItem
  };
};