import { useMemo } from 'react';

import type { FileItem } from '../types/file-item';
import type { SortConfig, SortDirection, SortField } from '../types/sorting';
import { sortItems } from '../utils/sorting';

export interface UseSortProps {
  items: FileItem[];
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

export interface UseSortResult {
  sortedItems: FileItem[];
  toggleSort: (field: SortField) => void;
  updateSortDirection: (direction: SortDirection) => void;
  updateFoldersFirst: (foldersFirst: boolean) => void;
  isSortedBy: (field: SortField) => boolean;
  getSortDirection: (field: SortField) => SortDirection | null;
}

export const useSort = ({ items, sortConfig, onSortChange }: UseSortProps): UseSortResult => {
  // Memoized sorted items for performance
  const sortedItems = useMemo(() => {
    return sortItems(items, sortConfig);
  }, [items, sortConfig]);

  // Toggle sort field - if already sorted by this field, toggle direction
  const toggleSort = (field: SortField) => {
    const newConfig: SortConfig = {
      ...sortConfig,
      field,
      direction: sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    };
    onSortChange(newConfig);
  };

  // Update sort direction
  const updateSortDirection = (direction: SortDirection) => {
    const newConfig: SortConfig = {
      ...sortConfig,
      direction
    };
    onSortChange(newConfig);
  };

  // Update folders first preference
  const updateFoldersFirst = (foldersFirst: boolean) => {
    const newConfig: SortConfig = {
      ...sortConfig,
      foldersFirst
    };
    onSortChange(newConfig);
  };

  // Check if currently sorted by a specific field
  const isSortedBy = (field: SortField): boolean => {
    return sortConfig.field === field;
  };

  // Get sort direction for a specific field (null if not sorted by this field)
  const getSortDirection = (field: SortField): SortDirection | null => {
    return sortConfig.field === field ? sortConfig.direction : null;
  };

  return {
    sortedItems,
    toggleSort,
    updateSortDirection,
    updateFoldersFirst,
    isSortedBy,
    getSortDirection
  };
};
