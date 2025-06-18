import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FileItem } from '../types/file-item';
import type { SortConfig, SortDirection, SortField } from '../types/sorting';
import { useSort } from '../use-sort';

// Mock the sorting utility
vi.mock('../utils/sorting', () => ({
  sortItems: vi.fn((items: FileItem[], config: SortConfig) => {
    const sorted = [...items];
    if (config.field === 'name') {
      sorted.sort((a, b) => {
        const nameA = a.name || a.key;
        const nameB = b.name || b.key;
        return config.direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    }
    if (config.foldersFirst) {
      sorted.sort((a, b) => {
        const aIsFolder = a.type === 'folder' || a.type === 'directory';
        const bIsFolder = b.type === 'folder' || b.type === 'directory';
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return 0;
      });
    }
    return sorted;
  })
}));

describe('useSort', () => {
  const mockItems: FileItem[] = [
    { key: 'file1.txt', name: 'file1.txt', type: 'file', size: 100, lastModified: '2023-01-01' },
    { key: 'folder1', name: 'folder1', type: 'folder' },
    { key: 'file2.md', name: 'file2.md', type: 'file', size: 200, lastModified: '2023-01-02' },
    { key: 'folder2', name: 'folder2', type: 'directory' }
  ];

  const defaultSortConfig: SortConfig = {
    field: 'name' as SortField,
    direction: 'asc' as SortDirection,
    foldersFirst: false
  };

  const mockOnSortChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sortedItems', () => {
    it('should return sorted items based on sort config', () => {
      const { result } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: defaultSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      expect(result.current.sortedItems).toHaveLength(4);
      expect(result.current.sortedItems[0].name).toBe('file1.txt');
    });

    it('should memoize sorted items when inputs do not change', () => {
      const { result, rerender } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: defaultSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      const firstResult = result.current.sortedItems;
      rerender();
      expect(result.current.sortedItems).toBe(firstResult);
    });

    it('should recalculate sorted items when items change', () => {
      const { result, rerender } = renderHook(
        ({ items }) =>
          useSort({
            items,
            sortConfig: defaultSortConfig,
            onSortChange: mockOnSortChange
          }),
        { initialProps: { items: mockItems } }
      );

      const firstResult = result.current.sortedItems;
      const newItems = [...mockItems, { key: 'file3.txt', name: 'file3.txt', type: 'file' as const }];
      rerender({ items: newItems });

      expect(result.current.sortedItems).not.toBe(firstResult);
      expect(result.current.sortedItems).toHaveLength(5);
    });
  });

  describe('toggleSort', () => {
    it('should toggle direction when same field is selected', () => {
      const { result } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: defaultSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      act(() => {
        result.current.toggleSort('name' as SortField);
      });

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'name',
        direction: 'desc',
        foldersFirst: false
      });
    });

    it('should set ascending direction when different field is selected', () => {
      const { result } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: defaultSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      act(() => {
        result.current.toggleSort('lastModified' as SortField);
      });

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'lastModified',
        direction: 'asc',
        foldersFirst: false
      });
    });
  });

  describe('updateSortDirection', () => {
    it('should update sort direction', () => {
      const { result } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: defaultSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      act(() => {
        result.current.updateSortDirection('desc' as SortDirection);
      });

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'name',
        direction: 'desc',
        foldersFirst: false
      });
    });

    it('should preserve other config properties', () => {
      const customSortConfig: SortConfig = {
        field: 'lastModified' as SortField,
        direction: 'asc' as SortDirection,
        foldersFirst: true
      };

      const { result } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: customSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      act(() => {
        result.current.updateSortDirection('desc' as SortDirection);
      });

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'lastModified',
        direction: 'desc',
        foldersFirst: true
      });
    });
  });

  describe('updateFoldersFirst', () => {
    it('should update folders first preference', () => {
      const { result } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: defaultSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      act(() => {
        result.current.updateFoldersFirst(true);
      });

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'name',
        direction: 'asc',
        foldersFirst: true
      });
    });

    it('should toggle folders first from true to false', () => {
      const foldersFirstConfig: SortConfig = {
        field: 'name' as SortField,
        direction: 'asc' as SortDirection,
        foldersFirst: true
      };

      const { result } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: foldersFirstConfig,
          onSortChange: mockOnSortChange
        })
      );

      act(() => {
        result.current.updateFoldersFirst(false);
      });

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'name',
        direction: 'asc',
        foldersFirst: false
      });
    });
  });

  describe('isSortedBy', () => {
    it('should return true when field matches current sort field', () => {
      const { result } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: defaultSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      expect(result.current.isSortedBy('name' as SortField)).toBe(true);
    });

    it('should return false when field does not match current sort field', () => {
      const { result } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: defaultSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      expect(result.current.isSortedBy('lastModified' as SortField)).toBe(false);
    });
  });

  describe('getSortDirection', () => {
    it('should return current direction when field matches', () => {
      const { result } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: defaultSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      expect(result.current.getSortDirection('name' as SortField)).toBe('asc');
    });

    it('should return null when field does not match', () => {
      const { result } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: defaultSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      expect(result.current.getSortDirection('lastModified' as SortField)).toBeNull();
    });

    it('should return correct direction for desc sorting', () => {
      const descSortConfig: SortConfig = {
        field: 'name' as SortField,
        direction: 'desc' as SortDirection,
        foldersFirst: false
      };

      const { result } = renderHook(() =>
        useSort({
          items: mockItems,
          sortConfig: descSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      expect(result.current.getSortDirection('name' as SortField)).toBe('desc');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle empty items array', () => {
      const { result } = renderHook(() =>
        useSort({
          items: [],
          sortConfig: defaultSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      expect(result.current.sortedItems).toEqual([]);
      expect(result.current.isSortedBy('name' as SortField)).toBe(true);
      expect(result.current.getSortDirection('name' as SortField)).toBe('asc');
    });

    it('should handle items with missing properties', () => {
      const itemsWithMissingProps: FileItem[] = [
        { key: 'file1', type: 'file' },
        { key: 'folder1', type: 'folder' }
      ];

      const { result } = renderHook(() =>
        useSort({
          items: itemsWithMissingProps,
          sortConfig: defaultSortConfig,
          onSortChange: mockOnSortChange
        })
      );

      expect(result.current.sortedItems).toHaveLength(2);
      expect(() => {
        act(() => {
          result.current.toggleSort('lastModified' as SortField);
        });
      }).not.toThrow();
    });
  });
});
