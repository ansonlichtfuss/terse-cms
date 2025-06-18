// Sort field options
export type SortField = 'name' | 'type' | 'size' | 'lastModified';

// Sort direction options
export type SortDirection = 'asc' | 'desc';

// Sort configuration interface
export interface SortConfig {
  field: SortField;
  direction: SortDirection;
  foldersFirst: boolean;
}

// Sort preferences for persistence
export interface SortPreferences {
  files: SortConfig;
  media: SortConfig;
}

// Default configurations
export const DEFAULT_SORT_CONFIG: SortConfig = {
  field: 'name',
  direction: 'asc',
  foldersFirst: true
};

export const DEFAULT_SORT_PREFERENCES: SortPreferences = {
  files: DEFAULT_SORT_CONFIG,
  media: { ...DEFAULT_SORT_CONFIG, field: 'lastModified' }
};
