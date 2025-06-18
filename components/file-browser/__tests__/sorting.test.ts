import { describe, expect, it } from 'vitest';

import type { FileItem } from '../file-browser';
import type { SortConfig } from '../types/sorting';
import { sortItems, validateSortConfig } from '../utils/sorting';

describe('sortItems', () => {
  const mockItems: FileItem[] = [
    { key: 'file1.txt', name: 'file1.txt', type: 'file', size: 100, lastModified: '2023-01-01' },
    { key: 'folder1', name: 'folder1', type: 'folder' },
    { key: 'file2.md', name: 'file2.md', type: 'file', size: 200, lastModified: '2023-01-02' },
    { key: 'folder2', name: 'folder2', type: 'directory' }
  ];

  it('should sort by name ascending', () => {
    const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };
    const result = sortItems(mockItems, config);

    expect(result[0].name).toBe('file1.txt');
    expect(result[1].name).toBe('file2.md');
    expect(result[2].name).toBe('folder1');
    expect(result[3].name).toBe('folder2');
  });

  it('should sort by name descending', () => {
    const config: SortConfig = { field: 'name', direction: 'desc', foldersFirst: false };
    const result = sortItems(mockItems, config);

    expect(result[0].name).toBe('folder2');
    expect(result[1].name).toBe('folder1');
    expect(result[2].name).toBe('file2.md');
    expect(result[3].name).toBe('file1.txt');
  });

  it('should place folders first when enabled', () => {
    const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: true };
    const result = sortItems(mockItems, config);

    expect(result[0].type).toBe('folder');
    expect(result[1].type).toBe('directory');
    expect(result[2].type).toBe('file');
    expect(result[3].type).toBe('file');
  });

  it('should sort by lastModified date', () => {
    const config: SortConfig = { field: 'lastModified', direction: 'asc', foldersFirst: false };
    const result = sortItems(mockItems, config);

    const fileItems = result.filter((item) => item.lastModified);
    expect(fileItems[0].lastModified).toBe('2023-01-01');
    expect(fileItems[1].lastModified).toBe('2023-01-02');
  });

  it('should handle items without names using key', () => {
    const itemsWithoutNames: FileItem[] = [
      { key: 'zebra.txt', type: 'file' },
      { key: 'alpha.txt', type: 'file' }
    ];

    const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };
    const result = sortItems(itemsWithoutNames, config);

    expect(result[0].key).toBe('alpha.txt');
    expect(result[1].key).toBe('zebra.txt');
  });

  it('should handle items without lastModified date', () => {
    const itemsWithoutDate: FileItem[] = [
      { key: 'file1.txt', name: 'file1.txt', type: 'file' },
      { key: 'file2.txt', name: 'file2.txt', type: 'file', lastModified: '2023-01-01' }
    ];

    const config: SortConfig = { field: 'lastModified', direction: 'asc', foldersFirst: false };
    const result = sortItems(itemsWithoutDate, config);

    // Items without date should be treated as timestamp 0
    expect(result[0].name).toBe('file1.txt');
    expect(result[1].name).toBe('file2.txt');
  });

  it('should not mutate original array', () => {
    const originalItems = [...mockItems];
    const config: SortConfig = { field: 'name', direction: 'desc', foldersFirst: false };

    sortItems(mockItems, config);

    expect(mockItems).toEqual(originalItems);
  });
});

describe('validateSortConfig', () => {
  it('should validate correct sort config', () => {
    const validConfig = {
      field: 'name',
      direction: 'asc',
      foldersFirst: true
    };

    const result = validateSortConfig(validConfig);
    expect(result).toEqual(validConfig);
  });

  it('should return null for invalid field', () => {
    const invalidConfig = {
      field: 'invalid',
      direction: 'asc',
      foldersFirst: true
    };

    const result = validateSortConfig(invalidConfig);
    expect(result).toBeNull();
  });

  it('should return null for invalid direction', () => {
    const invalidConfig = {
      field: 'name',
      direction: 'invalid',
      foldersFirst: true
    };

    const result = validateSortConfig(invalidConfig);
    expect(result).toBeNull();
  });

  it('should return null for null input', () => {
    const result = validateSortConfig(null);
    expect(result).toBeNull();
  });

  it('should return null for non-object input', () => {
    const result = validateSortConfig('invalid');
    expect(result).toBeNull();
  });

  it('should convert foldersFirst to boolean', () => {
    const config = {
      field: 'name',
      direction: 'asc',
      foldersFirst: 'true' // string instead of boolean
    };

    const result = validateSortConfig(config);
    expect(result?.foldersFirst).toBe(true);
  });

  it('should handle missing foldersFirst', () => {
    const config = {
      field: 'name',
      direction: 'asc'
      // foldersFirst missing
    };

    const result = validateSortConfig(config);
    expect(result?.foldersFirst).toBe(false);
  });
});
