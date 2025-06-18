import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SortConfig, SortPreferences } from '../types/sorting';
import { DEFAULT_SORT_PREFERENCES } from '../types/sorting';
import {
  getSortConfigForType,
  loadSortPreferences,
  saveSortPreferences,
  updateSortPreferences
} from '../utils/persistence';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('persistence utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveSortPreferences', () => {
    it('should save preferences to localStorage', () => {
      const preferences: SortPreferences = {
        files: { field: 'name', direction: 'asc', foldersFirst: true },
        media: { field: 'lastModified', direction: 'desc', foldersFirst: false }
      };

      saveSortPreferences(preferences);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'file-browser-sort-preferences',
        JSON.stringify(preferences)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const preferences: SortPreferences = DEFAULT_SORT_PREFERENCES;

      expect(() => saveSortPreferences(preferences)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save sort preferences:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('loadSortPreferences', () => {
    it('should return default preferences when no saved data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadSortPreferences();

      expect(result).toEqual(DEFAULT_SORT_PREFERENCES);
    });

    it('should load and validate saved preferences', () => {
      const savedPreferences = {
        files: { field: 'name', direction: 'asc', foldersFirst: true },
        media: { field: 'lastModified', direction: 'desc', foldersFirst: false }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPreferences));

      const result = loadSortPreferences();

      expect(result).toEqual(savedPreferences);
    });

    it('should use defaults for invalid saved preferences', () => {
      const invalidPreferences = {
        files: { field: 'invalid', direction: 'asc', foldersFirst: true },
        media: { field: 'lastModified', direction: 'invalid', foldersFirst: false }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidPreferences));

      const result = loadSortPreferences();

      expect(result.files).toEqual(DEFAULT_SORT_PREFERENCES.files);
      expect(result.media).toEqual(DEFAULT_SORT_PREFERENCES.media);
    });

    it('should handle JSON parse errors', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = loadSortPreferences();

      expect(result).toEqual(DEFAULT_SORT_PREFERENCES);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load sort preferences:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle localStorage access errors', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const result = loadSortPreferences();

      expect(result).toEqual(DEFAULT_SORT_PREFERENCES);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load sort preferences:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('getSortConfigForType', () => {
    it('should return files config for files type', () => {
      const preferences: SortPreferences = {
        files: { field: 'name', direction: 'asc', foldersFirst: true },
        media: { field: 'lastModified', direction: 'desc', foldersFirst: false }
      };

      const result = getSortConfigForType(preferences, 'files');

      expect(result).toEqual(preferences.files);
    });

    it('should return media config for media type', () => {
      const preferences: SortPreferences = {
        files: { field: 'name', direction: 'asc', foldersFirst: true },
        media: { field: 'lastModified', direction: 'desc', foldersFirst: false }
      };

      const result = getSortConfigForType(preferences, 'media');

      expect(result).toEqual(preferences.media);
    });
  });

  describe('updateSortPreferences', () => {
    it('should update files config', () => {
      const preferences: SortPreferences = {
        files: { field: 'name', direction: 'asc', foldersFirst: true },
        media: { field: 'lastModified', direction: 'desc', foldersFirst: false }
      };

      const newConfig: SortConfig = { field: 'lastModified', direction: 'desc', foldersFirst: false };

      const result = updateSortPreferences(preferences, 'files', newConfig);

      expect(result.files).toEqual(newConfig);
      expect(result.media).toEqual(preferences.media);
    });

    it('should update media config', () => {
      const preferences: SortPreferences = {
        files: { field: 'name', direction: 'asc', foldersFirst: true },
        media: { field: 'lastModified', direction: 'desc', foldersFirst: false }
      };

      const newConfig: SortConfig = { field: 'name', direction: 'asc', foldersFirst: true };

      const result = updateSortPreferences(preferences, 'media', newConfig);

      expect(result.files).toEqual(preferences.files);
      expect(result.media).toEqual(newConfig);
    });

    it('should not mutate original preferences', () => {
      const preferences: SortPreferences = {
        files: { field: 'name', direction: 'asc', foldersFirst: true },
        media: { field: 'lastModified', direction: 'desc', foldersFirst: false }
      };

      const originalPreferences = JSON.parse(JSON.stringify(preferences));
      const newConfig: SortConfig = { field: 'lastModified', direction: 'desc', foldersFirst: false };

      updateSortPreferences(preferences, 'files', newConfig);

      expect(preferences).toEqual(originalPreferences);
    });
  });
});
