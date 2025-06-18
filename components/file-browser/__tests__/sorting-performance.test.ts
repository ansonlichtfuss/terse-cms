import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FileItem } from '../types/file-item';
import type { SortConfig, SortDirection, SortField } from '../types/sorting';
import { sortItems } from '../utils/sorting';

// Performance test utilities
const createMockItems = (count: number): FileItem[] => {
  const items: FileItem[] = [];
  const fileTypes = ['file', 'folder', 'directory'] as const;
  const extensions = ['.txt', '.md', '.js', '.ts', '.json', '.css', '.html', '.png', '.jpg', '.pdf'];

  for (let i = 0; i < count; i++) {
    const type = fileTypes[i % fileTypes.length];
    const isFile = type === 'file';
    const extension = isFile ? extensions[i % extensions.length] : '';
    const name = `${isFile ? 'file' : 'folder'}-${i.toString().padStart(5, '0')}${extension}`;

    items.push({
      key: name,
      name,
      type,
      size: isFile ? Math.floor(Math.random() * 1000000) + 1000 : undefined,
      lastModified: new Date(2020 + (i % 4), i % 12, (i % 28) + 1).toISOString()
    });
  }

  return items;
};

const measurePerformance = (fn: () => void): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
};

const measureMemoryUsage = (fn: () => void): { before: number; after: number; delta: number } => {
  // Force garbage collection if available (Node.js with --expose-gc flag)
  if (global.gc) {
    global.gc();
  }

  const before = process.memoryUsage().heapUsed;
  fn();
  const after = process.memoryUsage().heapUsed;

  return {
    before,
    after,
    delta: after - before
  };
};

describe('Sorting Performance Tests', () => {
  const sortConfigs: SortConfig[] = [
    { field: 'name' as SortField, direction: 'asc' as SortDirection, foldersFirst: false },
    { field: 'name' as SortField, direction: 'desc' as SortDirection, foldersFirst: false },
    { field: 'size' as SortField, direction: 'asc' as SortDirection, foldersFirst: false },
    { field: 'size' as SortField, direction: 'desc' as SortDirection, foldersFirst: false },
    { field: 'type' as SortField, direction: 'asc' as SortDirection, foldersFirst: false },
    { field: 'lastModified' as SortField, direction: 'asc' as SortDirection, foldersFirst: false },
    { field: 'name' as SortField, direction: 'asc' as SortDirection, foldersFirst: true },
    { field: 'size' as SortField, direction: 'desc' as SortDirection, foldersFirst: true }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Large Dataset Performance', () => {
    it('should sort 1000 items within reasonable time', () => {
      const items = createMockItems(1000);
      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      const duration = measurePerformance(() => {
        sortItems(items, config);
      });

      // Should complete within 100ms for 1000 items
      expect(duration).toBeLessThan(100);
    });

    it('should sort 5000 items within reasonable time', () => {
      const items = createMockItems(5000);
      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      const duration = measurePerformance(() => {
        sortItems(items, config);
      });

      // Should complete within 500ms for 5000 items
      expect(duration).toBeLessThan(500);
    });

    it('should sort 10000 items within reasonable time', () => {
      const items = createMockItems(10000);
      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      const duration = measurePerformance(() => {
        sortItems(items, config);
      });

      // Should complete within 1000ms for 10000 items
      expect(duration).toBeLessThan(1000);
    });

    it('should handle very large datasets without memory issues', () => {
      const items = createMockItems(50000);
      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      const memoryUsage = measureMemoryUsage(() => {
        const result = sortItems(items, config);
        expect(result).toHaveLength(50000);
      });

      // Memory delta should be reasonable (less than 100MB for 50k items)
      expect(memoryUsage.delta).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('Sort Configuration Performance', () => {
    const testSizes = [1000, 5000, 10000];

    testSizes.forEach((size) => {
      describe(`Performance with ${size} items`, () => {
        let items: FileItem[];

        beforeEach(() => {
          items = createMockItems(size);
        });

        sortConfigs.forEach((config) => {
          it(`should sort by ${config.field} ${config.direction} ${config.foldersFirst ? 'with' : 'without'} folders first efficiently`, () => {
            const duration = measurePerformance(() => {
              const result = sortItems(items, config);
              expect(result).toHaveLength(size);
            });

            // Performance expectations based on dataset size
            const maxDuration = size <= 1000 ? 50 : size <= 5000 ? 250 : 500;
            expect(duration).toBeLessThan(maxDuration);
          });
        });
      });
    });
  });

  describe('Memoization Effectiveness', () => {
    it('should not mutate original array', () => {
      const items = createMockItems(1000);
      const originalItems = [...items];
      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      sortItems(items, config);

      expect(items).toEqual(originalItems);
    });

    it('should return consistent results for same input', () => {
      const items = createMockItems(1000);
      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      const result1 = sortItems(items, config);
      const result2 = sortItems(items, config);

      expect(result1).toEqual(result2);
    });

    it('should handle repeated sorting operations efficiently', () => {
      const items = createMockItems(5000);
      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      const durations: number[] = [];

      // Perform multiple sorting operations
      for (let i = 0; i < 10; i++) {
        const duration = measurePerformance(() => {
          sortItems(items, config);
        });
        durations.push(duration);
      }

      // All operations should be consistently fast
      durations.forEach((duration) => {
        expect(duration).toBeLessThan(500);
      });

      // Performance should not degrade significantly
      const firstDuration = durations[0];
      const lastDuration = durations[durations.length - 1];
      expect(lastDuration).toBeLessThan(firstDuration * 2);
    });
  });

  describe('Memory Usage and Cleanup', () => {
    it('should not leak memory with repeated operations', () => {
      const items = createMockItems(1000);
      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many sorting operations
      for (let i = 0; i < 100; i++) {
        sortItems(items, config);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should handle garbage collection of large sorted arrays', () => {
      const createAndSort = () => {
        const items = createMockItems(10000);
        const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };
        return sortItems(items, config);
      };

      const memoryUsage = measureMemoryUsage(() => {
        // Create multiple large sorted arrays that should be garbage collected
        for (let i = 0; i < 10; i++) {
          const result = createAndSort();
          expect(result).toHaveLength(10000);
        }
      });

      // Memory delta should be reasonable even with multiple large arrays
      expect(memoryUsage.delta).toBeLessThan(200 * 1024 * 1024);
    });
  });

  describe('Edge Case Performance', () => {
    it('should handle empty arrays efficiently', () => {
      const items: FileItem[] = [];
      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      const duration = measurePerformance(() => {
        const result = sortItems(items, config);
        expect(result).toEqual([]);
      });

      expect(duration).toBeLessThan(1);
    });

    it('should handle single item arrays efficiently', () => {
      const items = createMockItems(1);
      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      const duration = measurePerformance(() => {
        const result = sortItems(items, config);
        expect(result).toHaveLength(1);
      });

      expect(duration).toBeLessThan(1);
    });

    it('should handle arrays with identical items efficiently', () => {
      const baseItem: FileItem = { key: 'test', name: 'test', type: 'file', size: 100 };
      const items = Array(1000).fill(baseItem);
      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      const duration = measurePerformance(() => {
        const result = sortItems(items, config);
        expect(result).toHaveLength(1000);
      });

      expect(duration).toBeLessThan(50);
    });

    it('should handle arrays with missing properties efficiently', () => {
      const items: FileItem[] = Array(1000)
        .fill(null)
        .map((_, i) => ({
          key: `item-${i}`,
          type: i % 2 === 0 ? 'file' : 'folder'
          // Missing name, size, lastModified
        }));

      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      const duration = measurePerformance(() => {
        const result = sortItems(items, config);
        expect(result).toHaveLength(1000);
      });

      expect(duration).toBeLessThan(100);
    });
  });

  describe('Stress Testing', () => {
    it('should handle extreme dataset sizes', () => {
      // Skip this test in CI environments or if memory is limited
      if (process.env.CI || process.env.SKIP_STRESS_TESTS) {
        return;
      }

      const items = createMockItems(100000);
      const config: SortConfig = { field: 'name', direction: 'asc', foldersFirst: false };

      const duration = measurePerformance(() => {
        const result = sortItems(items, config);
        expect(result).toHaveLength(100000);
      });

      // Should complete within 5 seconds even for 100k items
      expect(duration).toBeLessThan(5000);
    });

    it('should handle rapid successive sort operations', () => {
      const items = createMockItems(1000);
      const configs = sortConfigs;

      const totalDuration = measurePerformance(() => {
        configs.forEach((config) => {
          const result = sortItems(items, config);
          expect(result).toHaveLength(1000);
        });
      });

      // All sort operations should complete quickly
      expect(totalDuration).toBeLessThan(500);
    });
  });
});
