import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useFileBrowserNavigation } from '../use-file-browser-navigation';
import { useFileSelection } from '../use-file-selection';

describe('useFileBrowserNavigation', () => {
  describe('initial path calculation', () => {
    it('returns empty string when no selectedPath provided', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({})
      );

      expect(result.current.currentPath).toBe('');
    });

    it('returns selectedPath when it is a directory path', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: 'src/components' })
      );

      expect(result.current.currentPath).toBe('src/components');
    });

    it('returns parent directory when selectedPath is a file', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: 'src/components/Button.tsx' })
      );

      expect(result.current.currentPath).toBe('src/components');
    });

    it('returns empty string when selectedPath is a root file', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: 'README.md' })
      );

      expect(result.current.currentPath).toBe('');
    });

    it('handles nested file paths correctly', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: 'very/deep/nested/file.js' })
      );

      expect(result.current.currentPath).toBe('very/deep/nested');
    });

    it('handles paths with multiple dots correctly', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: 'config/app.config.js' })
      );

      expect(result.current.currentPath).toBe('config');
    });

    it('treats paths without extensions as directories', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: 'src/utils/helpers' })
      );

      expect(result.current.currentPath).toBe('src/utils/helpers');
    });
  });

  describe('path navigation', () => {
    it('allows updating the current path', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({})
      );

      expect(result.current.currentPath).toBe('');

      act(() => {
        result.current.setCurrentPath('new/path');
      });

      expect(result.current.currentPath).toBe('new/path');
    });

    it('can navigate to nested paths', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: 'src' })
      );

      expect(result.current.currentPath).toBe('src');

      act(() => {
        result.current.setCurrentPath('src/components');
      });

      expect(result.current.currentPath).toBe('src/components');

      act(() => {
        result.current.setCurrentPath('src/components/ui');
      });

      expect(result.current.currentPath).toBe('src/components/ui');
    });

    it('can navigate back to parent directories', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: 'src/components/ui' })
      );

      expect(result.current.currentPath).toBe('src/components/ui');

      act(() => {
        result.current.setCurrentPath('src/components');
      });

      expect(result.current.currentPath).toBe('src/components');

      act(() => {
        result.current.setCurrentPath('src');
      });

      expect(result.current.currentPath).toBe('src');

      act(() => {
        result.current.setCurrentPath('');
      });

      expect(result.current.currentPath).toBe('');
    });

    it('handles root navigation', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: 'src/components' })
      );

      act(() => {
        result.current.setCurrentPath('');
      });

      expect(result.current.currentPath).toBe('');
    });
  });

  describe('edge cases', () => {
    it('handles empty string selectedPath', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: '' })
      );

      expect(result.current.currentPath).toBe('');
    });

    it('handles selectedPath with trailing slash', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: 'src/components/' })
      );

      expect(result.current.currentPath).toBe('src/components/');
    });

    it('handles paths with special characters', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: 'src/my-component/index.ts' })
      );

      expect(result.current.currentPath).toBe('src/my-component');
    });

    it('handles single character paths', () => {
      const { result } = renderHook(() => 
        useFileBrowserNavigation({ selectedPath: 'a/b.js' })
      );

      expect(result.current.currentPath).toBe('a');
    });
  });
});

describe('useFileSelection', () => {
  describe('initial selection state', () => {
    it('initializes with null when no selectedPath provided', () => {
      const { result } = renderHook(() => 
        useFileSelection({})
      );

      expect(result.current.selectedItem).toBe(null);
    });

    it('initializes with selectedPath when provided', () => {
      const { result } = renderHook(() => 
        useFileSelection({ selectedPath: 'src/components/Button.tsx' })
      );

      expect(result.current.selectedItem).toBe('src/components/Button.tsx');
    });

    it('handles empty string selectedPath', () => {
      const { result } = renderHook(() => 
        useFileSelection({ selectedPath: '' })
      );

      expect(result.current.selectedItem).toBe(null);
    });
  });

  describe('selection updates', () => {
    it('updates selectedItem when setSelectedItem is called', () => {
      const { result } = renderHook(() => 
        useFileSelection({})
      );

      expect(result.current.selectedItem).toBe(null);

      act(() => {
        result.current.setSelectedItem('new/file.ts');
      });

      expect(result.current.selectedItem).toBe('new/file.ts');
    });

    it('can clear selection by setting to null', () => {
      const { result } = renderHook(() => 
        useFileSelection({ selectedPath: 'initial/file.ts' })
      );

      expect(result.current.selectedItem).toBe('initial/file.ts');

      act(() => {
        result.current.setSelectedItem(null);
      });

      expect(result.current.selectedItem).toBe(null);
    });

    it('can update selection multiple times', () => {
      const { result } = renderHook(() => 
        useFileSelection({})
      );

      act(() => {
        result.current.setSelectedItem('file1.ts');
      });
      expect(result.current.selectedItem).toBe('file1.ts');

      act(() => {
        result.current.setSelectedItem('file2.ts');
      });
      expect(result.current.selectedItem).toBe('file2.ts');

      act(() => {
        result.current.setSelectedItem('folder/file3.ts');
      });
      expect(result.current.selectedItem).toBe('folder/file3.ts');
    });
  });

  describe('selectedPath prop changes', () => {
    it('updates selection when selectedPath prop changes', () => {
      const { result, rerender } = renderHook(
        ({ selectedPath }) => useFileSelection({ selectedPath }),
        { initialProps: { selectedPath: 'initial.ts' } }
      );

      expect(result.current.selectedItem).toBe('initial.ts');

      rerender({ selectedPath: 'updated.ts' });

      expect(result.current.selectedItem).toBe('updated.ts');
    });

    it('updates selection when selectedPath changes from undefined to defined', () => {
      const { result, rerender } = renderHook(
        ({ selectedPath }) => useFileSelection({ selectedPath }),
        { initialProps: { selectedPath: undefined } }
      );

      expect(result.current.selectedItem).toBe(null);

      rerender({ selectedPath: 'new-file.ts' });

      expect(result.current.selectedItem).toBe('new-file.ts');
    });

    it('does not override manual selection when selectedPath prop changes', () => {
      const { result, rerender } = renderHook(
        ({ selectedPath }) => useFileSelection({ selectedPath }),
        { initialProps: { selectedPath: 'initial.ts' } }
      );

      // Manually change selection
      act(() => {
        result.current.setSelectedItem('manual.ts');
      });
      expect(result.current.selectedItem).toBe('manual.ts');

      // Props change should still update the selection
      rerender({ selectedPath: 'prop-updated.ts' });
      expect(result.current.selectedItem).toBe('prop-updated.ts');
    });

    it('handles selectedPath changing to empty string', () => {
      const { result, rerender } = renderHook(
        ({ selectedPath }) => useFileSelection({ selectedPath }),
        { initialProps: { selectedPath: 'file.ts' } }
      );

      expect(result.current.selectedItem).toBe('file.ts');

      rerender({ selectedPath: '' });

      expect(result.current.selectedItem).toBe('file.ts');
    });

    it('handles selectedPath changing to undefined', () => {
      const { result, rerender } = renderHook(
        ({ selectedPath }) => useFileSelection({ selectedPath }),
        { initialProps: { selectedPath: 'file.ts' } }
      );

      expect(result.current.selectedItem).toBe('file.ts');

      rerender({ selectedPath: undefined });

      // Should not change when selectedPath becomes undefined
      expect(result.current.selectedItem).toBe('file.ts');
    });
  });

  describe('edge cases', () => {
    it('handles special characters in file paths', () => {
      const specialPath = 'src/my-component@2x.png';
      const { result } = renderHook(() => 
        useFileSelection({ selectedPath: specialPath })
      );

      expect(result.current.selectedItem).toBe(specialPath);
    });

    it('handles very long file paths', () => {
      const longPath = 'very/deep/nested/folder/structure/with/many/levels/file.ts';
      const { result } = renderHook(() => 
        useFileSelection({ selectedPath: longPath })
      );

      expect(result.current.selectedItem).toBe(longPath);
    });

    it('handles paths with spaces', () => {
      const pathWithSpaces = 'My Documents/Project Files/readme.txt';
      const { result } = renderHook(() => 
        useFileSelection({ selectedPath: pathWithSpaces })
      );

      expect(result.current.selectedItem).toBe(pathWithSpaces);
    });
  });

  describe('integration scenarios', () => {
    it('maintains selection state across multiple operations', () => {
      const { result } = renderHook(() => 
        useFileSelection({ selectedPath: 'initial.ts' })
      );

      // Initial state
      expect(result.current.selectedItem).toBe('initial.ts');

      // Select a file
      act(() => {
        result.current.setSelectedItem('selected.ts');
      });
      expect(result.current.selectedItem).toBe('selected.ts');

      // Clear selection
      act(() => {
        result.current.setSelectedItem(null);
      });
      expect(result.current.selectedItem).toBe(null);

      // Select another file
      act(() => {
        result.current.setSelectedItem('another.ts');
      });
      expect(result.current.selectedItem).toBe('another.ts');
    });

    it('can be used for both file and folder selection', () => {
      const { result } = renderHook(() => 
        useFileSelection({})
      );

      // Select a file
      act(() => {
        result.current.setSelectedItem('src/components/Button.tsx');
      });
      expect(result.current.selectedItem).toBe('src/components/Button.tsx');

      // Select a folder
      act(() => {
        result.current.setSelectedItem('src/components');
      });
      expect(result.current.selectedItem).toBe('src/components');

      // Select a root file
      act(() => {
        result.current.setSelectedItem('package.json');
      });
      expect(result.current.selectedItem).toBe('package.json');
    });
  });
});