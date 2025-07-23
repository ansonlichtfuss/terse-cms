import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFileOperations } from '../use-file-operations';

// Mock all dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

vi.mock('@/hooks/api/shared', () => ({
  useQueryInvalidation: vi.fn(() => ({
    invalidateFileQueries: vi.fn(),
    invalidateGitQueries: vi.fn(),
    invalidateDirectoryQueries: vi.fn()
  }))
}));

vi.mock('@/hooks/api/use-create-file-mutation', () => ({
  useCreateFileMutation: vi.fn(() => ({
    mutate: vi.fn()
  }))
}));

vi.mock('@/hooks/api/use-create-folder-mutation', () => ({
  useCreateFolderMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false
  }))
}));

vi.mock('@/hooks/api/use-delete-file-mutation', () => ({
  useDeleteFileMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false
  }))
}));

vi.mock('@/hooks/api/use-rename-file-mutation', () => ({
  useRenameFileMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false
  }))
}));

vi.mock('@/hooks/api/use-move-file-mutation', () => ({
  useMoveFileMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false
  }))
}));

vi.mock('@/hooks/api/use-create-s3-folder-mutation', () => ({
  useCreateS3FolderMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false
  }))
}));

vi.mock('@/hooks/api/use-s3-operations', () => ({
  useDeleteS3ItemMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false
  })),
  useMoveS3ItemMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false
  }))
}));

vi.mock('@/hooks/use-repository-from-url', () => ({
  useRepositoryFromUrl: vi.fn(() => ({
    currentRepositoryId: 'test-repo-123'
  }))
}));

vi.mock('../../utils', () => ({
  getItemPath: vi.fn((item) => item.path || `/test/${item.name}`)
}));

describe('useFileOperations', () => {
  const mockRouter = { push: vi.fn() };
  const mockToast = vi.fn();
  const mockInvalidateFileQueries = vi.fn();
  const mockInvalidateGitQueries = vi.fn();
  const mockInvalidateDirectoryQueries = vi.fn();

  const defaultProps = {
    type: 'files' as const,
    currentPath: '/test',
    deleteDialog: {
      isOpen: false,
      item: null,
      openDialog: vi.fn(),
      closeDialog: vi.fn()
    }
  };

  const mockFileItem = {
    name: 'test-file.md',
    path: '/test/test-file.md',
    type: 'file' as const,
    key: 'test-file.md'
  };

  const mockFolderItem = {
    name: 'test-folder',
    path: '/test/test-folder',
    type: 'directory' as const,
    key: 'test-folder'
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mocks
    const { useRouter } = vi.mocked(await import('next/navigation'));
    const { toast } = vi.mocked(await import('@/components/ui/use-toast'));
    const { useQueryInvalidation } = vi.mocked(await import('@/hooks/api/shared'));

    useRouter.mockReturnValue(mockRouter);
    toast.mockImplementation(mockToast);
    useQueryInvalidation.mockReturnValue({
      invalidateFileQueries: mockInvalidateFileQueries,
      invalidateGitQueries: mockInvalidateGitQueries,
      invalidateDirectoryQueries: mockInvalidateDirectoryQueries
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('handleCreateFolder', () => {
    it('should create folder for files type', async () => {
      // Arrange
      const mockCreateFolder = vi.fn();
      const { useCreateFolderMutation } = vi.mocked(await import('@/hooks/api/use-create-folder-mutation'));
      useCreateFolderMutation.mockReturnValue({
        mutate: mockCreateFolder,
        isPending: false
      });

      const { result } = renderHook(() => useFileOperations(defaultProps));

      // Act
      await result.current.handleCreateFolder('new-folder');

      // Assert
      expect(mockCreateFolder).toHaveBeenCalledWith(
        { path: '/test', name: 'new-folder' },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function)
        })
      );
    });

    it('should create folder for media type', async () => {
      // Arrange
      const mockCreateS3Folder = vi.fn();
      const { useCreateS3FolderMutation } = vi.mocked(await import('@/hooks/api/use-create-s3-folder-mutation'));
      useCreateS3FolderMutation.mockReturnValue({
        mutate: mockCreateS3Folder,
        isPending: false
      });

      const mediaProps = { ...defaultProps, type: 'media' as const };
      const { result } = renderHook(() => useFileOperations(mediaProps));

      // Act
      await result.current.handleCreateFolder('new-media-folder');

      // Assert
      expect(mockCreateS3Folder).toHaveBeenCalledWith(
        { path: '/test', name: 'new-media-folder' },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function)
        })
      );
    });
  });

  describe('handleDelete', () => {
    it('should delete file for files type', async () => {
      // Arrange
      const mockDeleteFile = vi.fn();
      const { useDeleteFileMutation } = vi.mocked(await import('@/hooks/api/use-delete-file-mutation'));
      useDeleteFileMutation.mockReturnValue({
        mutate: mockDeleteFile,
        isPending: false
      });

      const { result } = renderHook(() => useFileOperations(defaultProps));

      // Act
      await result.current.handleDelete(mockFileItem);

      // Assert
      expect(mockDeleteFile).toHaveBeenCalledWith(
        { path: '/test/test-file.md' },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function)
        })
      );
    });

    it('should delete media for media type', async () => {
      // Arrange
      const mockDeleteS3Item = vi.fn();
      const { useDeleteS3ItemMutation } = vi.mocked(await import('@/hooks/api/use-s3-operations'));
      useDeleteS3ItemMutation.mockReturnValue({
        mutate: mockDeleteS3Item,
        isPending: false
      });

      const mediaProps = { ...defaultProps, type: 'media' as const };
      const { result } = renderHook(() => useFileOperations(mediaProps));

      // Act
      await result.current.handleDelete(mockFileItem);

      // Assert
      expect(mockDeleteS3Item).toHaveBeenCalledWith(
        { key: 'test-file.md', type: 'file' },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function)
        })
      );
    });
  });

  describe('handleRename', () => {
    it('should rename file for files type', async () => {
      // Arrange
      const mockRenameFile = vi.fn();
      const { useRenameFileMutation } = vi.mocked(await import('@/hooks/api/use-rename-file-mutation'));
      useRenameFileMutation.mockReturnValue({
        mutate: mockRenameFile,
        isPending: false
      });

      const { result } = renderHook(() => useFileOperations(defaultProps));

      // Act
      await result.current.handleRename(mockFileItem, 'new-name.md');

      // Assert
      expect(mockRenameFile).toHaveBeenCalledWith(
        {
          sourcePath: '/test/test-file.md',
          newName: 'new-name.md',
          type: 'file'
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function)
        })
      );
    });

    it('should show not implemented toast for media rename', async () => {
      // Arrange
      const mediaProps = { ...defaultProps, type: 'media' as const };
      const { result } = renderHook(() => useFileOperations(mediaProps));

      // Act
      await result.current.handleRename(mockFileItem, 'new-name.md');

      // Assert
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Rename for media is not implemented yet'
      });
    });
  });

  describe('handleMove', () => {
    it('should move file for files type', async () => {
      // Arrange
      const mockMoveFile = vi.fn();
      const { useMoveFileMutation } = vi.mocked(await import('@/hooks/api/use-move-file-mutation'));
      useMoveFileMutation.mockReturnValue({
        mutate: mockMoveFile,
        isPending: false
      });

      const { result } = renderHook(() => useFileOperations(defaultProps));

      // Act
      await result.current.handleMove(mockFileItem, '/new/destination');

      // Assert
      expect(mockMoveFile).toHaveBeenCalledWith(
        {
          sourcePath: '/test/test-file.md',
          destinationPath: 'new/destination',
          type: 'file'
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function)
        })
      );
    });
  });

  describe('handleCreateFile', () => {
    it('should create file with content', async () => {
      // Arrange
      const mockCreateFile = vi.fn();
      const { useCreateFileMutation } = vi.mocked(await import('@/hooks/api/use-create-file-mutation'));
      useCreateFileMutation.mockReturnValue({
        mutate: mockCreateFile
      });

      const { result } = renderHook(() => useFileOperations(defaultProps));

      // Act
      await result.current.handleCreateFile('/test/new-file.md', 'file content');

      // Assert
      expect(mockCreateFile).toHaveBeenCalledWith(
        { filePath: '/test/new-file.md', content: 'file content' },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function)
        })
      );
    });
  });
});
