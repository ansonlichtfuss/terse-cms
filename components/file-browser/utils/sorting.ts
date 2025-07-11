import type { FileItem } from '../types/file-item';
import type { SortConfig, SortDirection, SortField } from '../types/sorting';

// Main sorting function
export const sortItems = (items: FileItem[], config: SortConfig): FileItem[] => {
  if (!items) return [];

  const { field, direction, foldersFirst } = config;

  return [...items].sort((a, b) => {
    // Folders first logic
    if (foldersFirst) {
      const aIsFolder = a.type === 'folder' || a.type === 'directory';
      const bIsFolder = b.type === 'folder' || b.type === 'directory';

      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
    }

    // Field-specific sorting
    let comparison = 0;
    switch (field) {
      case 'name':
        comparison = compareNames(a, b);
        break;
      case 'lastModified':
        comparison = compareDates(a, b);
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
};

// Name comparison (case-insensitive)
const compareNames = (a: FileItem, b: FileItem): number => {
  const nameA = (a.name || a.key || '').toLowerCase();
  const nameB = (b.name || b.key || '').toLowerCase();
  return nameA.localeCompare(nameB);
};

// Date comparison
const compareDates = (a: FileItem, b: FileItem): number => {
  const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
  const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
  return dateA - dateB;
};

// Validation function
export const validateSortConfig = (config: unknown): SortConfig | null => {
  if (!config || typeof config !== 'object') return null;

  const { field, direction, foldersFirst } = config as Record<string, unknown>;

  const validFields: SortField[] = ['name', 'lastModified'];
  const validDirections: SortDirection[] = ['asc', 'desc'];

  if (!validFields.includes(field as SortField) || !validDirections.includes(direction as SortDirection)) {
    return null;
  }

  return {
    field: field as SortField,
    direction: direction as SortDirection,
    foldersFirst: Boolean(foldersFirst)
  };
};
