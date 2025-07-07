import { useEffect, useState } from 'react';
import type { SortConfig, SortPreferences } from '@/components/file-browser/types/sorting';
import {
  getSortConfigForType,
  loadSortPreferences,
  saveSortPreferences,
  updateSortPreferences
} from '@/components/file-browser/utils/persistence';

interface UseFileBrowserSortingProps {
  type: 'files' | 'media';
}

export const useFileBrowserSorting = ({ type }: UseFileBrowserSortingProps) => {
  const [sortPreferences, setSortPreferences] = useState<SortPreferences>(() => {
    return loadSortPreferences();
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    const preferences = loadSortPreferences();
    return getSortConfigForType(preferences, type);
  });

  useEffect(() => {
    const newConfig = getSortConfigForType(sortPreferences, type);
    setSortConfig(newConfig);
  }, [type, sortPreferences]);

  const updateSort = (config: SortConfig) => {
    setSortConfig(config);
    const updatedPreferences = updateSortPreferences(sortPreferences, type, config);
    setSortPreferences(updatedPreferences);
    saveSortPreferences(updatedPreferences);
  };

  return {
    sortConfig,
    updateSort
  };
};