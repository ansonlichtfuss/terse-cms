import type { SortConfig, SortPreferences } from '../types/sorting';
import { DEFAULT_SORT_PREFERENCES } from '../types/sorting';
import { validateSortConfig } from './sorting';

const STORAGE_KEY = 'file-browser-sort-preferences';

export const saveSortPreferences = (preferences: SortPreferences): void => {
  if (typeof localStorage === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save sort preferences:', error);
  }
};

export const loadSortPreferences = (): SortPreferences => {
  if (typeof localStorage === 'undefined') return DEFAULT_SORT_PREFERENCES;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_SORT_PREFERENCES;

    const parsed = JSON.parse(saved);

    // Validate both files and media configs
    const filesConfig = validateSortConfig(parsed.files);
    const mediaConfig = validateSortConfig(parsed.media);

    return {
      files: filesConfig || DEFAULT_SORT_PREFERENCES.files,
      media: mediaConfig || DEFAULT_SORT_PREFERENCES.media
    };
  } catch (error) {
    console.warn('Failed to load sort preferences:', error);
    return DEFAULT_SORT_PREFERENCES;
  }
};

export const getSortConfigForType = (preferences: SortPreferences, type: 'files' | 'media'): SortConfig => {
  return type === 'files' ? preferences.files : preferences.media;
};

export const updateSortPreferences = (
  preferences: SortPreferences,
  type: 'files' | 'media',
  config: SortConfig
): SortPreferences => {
  const updated = { ...preferences };
  if (type === 'files') {
    updated.files = config;
  } else {
    updated.media = config;
  }
  return updated;
};
