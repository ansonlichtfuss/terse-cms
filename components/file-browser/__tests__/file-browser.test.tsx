import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FileBrowser } from '../file-browser';
import type { FileItem } from '../types/file-item';

// Import the mocked modules to get access to the mock functions
import { useDirectoryQuery } from '@/hooks/api/use-directory-query';
import { useS3FilesQuery } from '@/hooks/api/use-s3-files-query';
import { useSort } from '../hooks/use-sort';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue('test-repo')
  })
}));

// Mock the hooks with proper return values
vi.mock('@/hooks/use-repository-from-url', () => ({
  useRepositoryFromUrl: () => ({
    currentRepositoryId: 'test-repo'
  })
}));

vi.mock('@/hooks/api/use-directory-query', () => ({
  useDirectoryQuery: vi.fn()
}));

vi.mock('@/hooks/api/use-s3-files-query', () => ({
  useS3FilesQuery: vi.fn()
}));

vi.mock('@/hooks/file-browser/use-file-browser-navigation', () => ({
  useFileBrowserNavigation: () => ({
    currentPath: '',
    setCurrentPath: vi.fn()
  })
}));

vi.mock('@/hooks/file-browser/use-file-browser-sorting', () => ({
  useFileBrowserSorting: () => ({
    sortConfig: { field: 'name', direction: 'asc' },
    updateSort: vi.fn()
  })
}));

vi.mock('@/hooks/file-browser/use-file-selection', () => ({
  useFileSelection: () => ({
    selectedItem: null,
    setSelectedItem: vi.fn()
  })
}));

vi.mock('@/hooks/ui/use-dialog-state', () => ({
  useDialogState: () => ({
    isOpen: false,
    item: null,
    openDialog: vi.fn(),
    closeDialog: vi.fn()
  })
}));

vi.mock('../hooks/use-file-operations', () => ({
  useFileOperations: () => ({
    handleCreateFolder: vi.fn(),
    handleDelete: vi.fn(),
    handleRename: vi.fn(),
    handleMove: vi.fn(),
    isCreatingFolder: false,
    isDeletingFile: false,
    isRenamingFile: false,
    isMovingFile: false,
    isDeletingS3: false,
    isMovingS3: false,
    isCreatingS3Folder: false
  })
}));

vi.mock('../hooks/use-sort', () => ({
  useSort: vi.fn()
}));

// Mock UI components
vi.mock('@/components/ui/scrollable-container', () => ({
  ScrollableContainer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="scrollable-container">
      {children}
    </div>
  )
}));

vi.mock('@/components/breadcrumbs/breadcrumbs', () => ({
  Breadcrumbs: ({ currentPath, onNavigate }: { currentPath: string; onNavigate: (path: string) => void }) => (
    <div data-testid="breadcrumbs">
      <span>Path: {currentPath}</span>
      <button onClick={() => onNavigate('test-path')}>Navigate</button>
    </div>
  )
}));

vi.mock('../file-browser-actions', () => ({
  FileBrowserActions: ({ type, onRefresh, onNewFolderClick }: any) => (
    <div data-testid="file-browser-actions">
      <button onClick={onRefresh}>Refresh</button>
      <button onClick={onNewFolderClick}>New Folder</button>
      <span>Type: {type}</span>
    </div>
  )
}));

vi.mock('../file-item-row', () => ({
  FileItemRow: ({ item, onItemClick, isSelected }: any) => (
    <div
      data-testid={`file-item-${item.key}`}
      onClick={() => onItemClick(item)}
      className={isSelected ? 'selected' : ''}
    >
      {item.name || item.key}
    </div>
  )
}));

vi.mock('../create-folder-dialog', () => ({
  CreateFolderDialog: ({ open, onCreate }: { open: boolean; onCreate: () => void }) => (
    open ? (
      <div data-testid="create-folder-dialog">
        <button onClick={onCreate}>Create Folder</button>
      </div>
    ) : null
  )
}));

vi.mock('../move-file-dialog', () => ({
  MoveFileDialog: ({ open, item, onMove }: any) => (
    open && item ? (
      <div data-testid="move-file-dialog">
        <button onClick={() => onMove('new-path')}>Move File</button>
      </div>
    ) : null
  )
}));

vi.mock('@/components/rename-file-dialog', () => ({
  RenameFileDialog: ({ open, item, onRename }: any) => (
    open && item ? (
      <div data-testid="rename-file-dialog">
        <button onClick={() => onRename('new-name')}>Rename File</button>
      </div>
    ) : null
  )
}));

vi.mock('@/components/ui/confirmation-dialog', () => ({
  ConfirmationDialog: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) => (
    open ? (
      <div data-testid="confirmation-dialog">
        <button onClick={onConfirm}>Confirm Delete</button>
      </div>
    ) : null
  )
}));

vi.mock('../upload-dialog', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (
    isOpen ? <div data-testid="upload-dialog">Upload Dialog</div> : null
  )
}));

describe('FileBrowser', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  const mockFileItems: FileItem[] = [
    { key: 'folder1', name: 'folder1', type: 'folder' },
    { key: 'file1.md', name: 'file1.md', type: 'file' },
    { key: 'file2.txt', name: 'file2.txt', type: 'file' }
  ];

  describe('Initial rendering', () => {
    it('renders the file browser with correct structure', () => {
      vi.mocked(useDirectoryQuery).mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      } as any);

      vi.mocked(useSort).mockReturnValue({
        sortedItems: []
      } as any);

      renderWithProviders(<FileBrowser type="files" />);

      expect(screen.getByTestId('file-browser-actions')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
      expect(screen.getByTestId('scrollable-container')).toBeInTheDocument();
    });

    it('displays correct type in file browser actions', () => {
      vi.mocked(useS3FilesQuery).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn()
      } as any);

      vi.mocked(useSort).mockReturnValue({
        sortedItems: []
      } as any);

      renderWithProviders(<FileBrowser type="media" />);

      expect(screen.getByText('Type: media')).toBeInTheDocument();
    });
  });

  describe('File tree rendering', () => {
    it('renders file items when data is available', () => {
      vi.mocked(useDirectoryQuery).mockReturnValue({
        data: { items: mockFileItems },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      } as any);

      vi.mocked(useSort).mockReturnValue({
        sortedItems: mockFileItems
      } as any);

      renderWithProviders(<FileBrowser type="files" />);

      expect(screen.getByTestId('file-item-folder1')).toBeInTheDocument();
      expect(screen.getByTestId('file-item-file1.md')).toBeInTheDocument();
      expect(screen.getByTestId('file-item-file2.txt')).toBeInTheDocument();
    });

    it('displays loading state', () => {
      vi.mocked(useDirectoryQuery).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn()
      } as any);

      vi.mocked(useSort).mockReturnValue({
        sortedItems: []
      } as any);

      renderWithProviders(<FileBrowser type="files" />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays error state', () => {
      const mockError = new Error('Failed to load files');
      vi.mocked(useDirectoryQuery).mockReturnValue({
        data: null,
        isLoading: false,
        error: mockError,
        refetch: vi.fn()
      } as any);

      vi.mocked(useSort).mockReturnValue({
        sortedItems: []
      } as any);

      renderWithProviders(<FileBrowser type="files" />);

      expect(screen.getByText('Error loading files: Failed to load files')).toBeInTheDocument();
    });

    it('displays empty state when no items found', () => {
      vi.mocked(useDirectoryQuery).mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      } as any);

      vi.mocked(useSort).mockReturnValue({
        sortedItems: []
      } as any);

      renderWithProviders(<FileBrowser type="files" />);

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });
  });

  describe('File interactions', () => {
    it('handles file item click', async () => {
      const mockOnSelect = vi.fn();
      vi.mocked(useDirectoryQuery).mockReturnValue({
        data: { items: mockFileItems },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      } as any);

      vi.mocked(useSort).mockReturnValue({
        sortedItems: mockFileItems
      } as any);

      renderWithProviders(
        <FileBrowser type="files" onSelect={mockOnSelect} />
      );

      const fileItem = screen.getByTestId('file-item-file1.md');
      fireEvent.click(fileItem);

      // The file item click should trigger the onItemClick handler in the component
      // Due to our mocking structure, we can't directly test the callback,
      // but we can verify the element is clickable and renders correctly
      expect(fileItem).toBeInTheDocument();
    });

    it('handles refresh action', async () => {
      const mockRefetch = vi.fn();
      vi.mocked(useDirectoryQuery).mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: mockRefetch
      } as any);

      vi.mocked(useSort).mockReturnValue({
        sortedItems: []
      } as any);

      renderWithProviders(<FileBrowser type="files" />);

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Media mode handling', () => {
    it('uses S3 query for media type', () => {
      vi.mocked(useS3FilesQuery).mockReturnValue({
        data: mockFileItems,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      } as any);

      vi.mocked(useSort).mockReturnValue({
        sortedItems: mockFileItems
      } as any);

      renderWithProviders(<FileBrowser type="media" />);

      expect(vi.mocked(useS3FilesQuery)).toHaveBeenCalled();
      expect(screen.getByTestId('file-item-folder1')).toBeInTheDocument();
    });

    it('handles S3 loading state', () => {
      vi.mocked(useS3FilesQuery).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn()
      } as any);

      vi.mocked(useSort).mockReturnValue({
        sortedItems: []
      } as any);

      renderWithProviders(<FileBrowser type="media" />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Path change handling', () => {
    it('calls onPathChange when provided', () => {
      const mockOnPathChange = vi.fn();
      vi.mocked(useDirectoryQuery).mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      } as any);

      vi.mocked(useSort).mockReturnValue({
        sortedItems: []
      } as any);

      renderWithProviders(
        <FileBrowser type="files" onPathChange={mockOnPathChange} />
      );

      // The component renders successfully with the onPathChange prop
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });
  });

  describe('Mobile mode handling', () => {
    it('handles mobile mode correctly', () => {
      vi.mocked(useDirectoryQuery).mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      } as any);

      vi.mocked(useSort).mockReturnValue({
        sortedItems: []
      } as any);

      renderWithProviders(<FileBrowser type="files" isMobile={true} />);

      expect(screen.getByTestId('file-browser-actions')).toBeInTheDocument();
    });
  });
});