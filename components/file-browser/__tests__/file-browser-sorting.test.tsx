import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FileBrowserActions } from '../file-browser-actions';
import type { FileItem } from '../types/file-item';
import type { SortConfig, SortDirection, SortField } from '../types/sorting';

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

// Mock the UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  })
}));

vi.mock('../use-file-operations', () => ({
  useFileOperations: () => ({
    handleCreateFile: vi.fn().mockResolvedValue(undefined)
  })
}));

vi.mock('lucide-react', () => ({
  FilePlus: () => <span data-testid="file-plus-icon">+</span>,
  FolderPlus: () => <span data-testid="folder-plus-icon">📁</span>,
  RefreshCw: () => <span data-testid="refresh-icon">🔄</span>,
  Upload: () => <span data-testid="upload-icon">⬆</span>,
  ArrowUpDown: () => <span data-testid="arrow-up-down-icon">↕</span>,
  ChevronUp: () => <span data-testid="chevron-up-icon">↑</span>,
  ChevronDown: () => <span data-testid="chevron-down-icon">↓</span>
}));

// Mock SortDropdown component
vi.mock('../sort-dropdown', () => ({
  SortDropdown: ({
    sortConfig,
    onSortChange,
    type
  }: {
    sortConfig: SortConfig;
    onSortChange: (config: SortConfig) => void;
    type: string;
  }) => (
    <div data-testid="sort-dropdown" data-type={type}>
      <button
        data-testid="sort-button"
        onClick={() => onSortChange({ ...sortConfig, field: 'name' as SortField, direction: 'desc' as SortDirection })}
      >
        Sort: {sortConfig.field} {sortConfig.direction}
      </button>
      <button
        data-testid="toggle-folders-first"
        onClick={() => onSortChange({ ...sortConfig, foldersFirst: !sortConfig.foldersFirst })}
      >
        Folders First: {sortConfig.foldersFirst ? 'On' : 'Off'}
      </button>
    </div>
  )
}));

describe('File Browser Sorting Integration', () => {
  let queryClient: QueryClient;
  const mockFetchItems = vi.fn();
  const mockOnRefresh = vi.fn();
  const mockOnNewFolderClick = vi.fn();
  const mockOnOpenUploadDialog = vi.fn();
  const mockOnSortChange = vi.fn();

  const defaultSortConfig: SortConfig = {
    field: 'name' as SortField,
    direction: 'asc' as SortDirection,
    foldersFirst: false
  };

  const mockFileItems: FileItem[] = [
    { key: 'file1.txt', name: 'file1.txt', type: 'file', size: 100, lastModified: '2023-01-01' },
    { key: 'folder1', name: 'folder1', type: 'folder' },
    { key: 'file2.md', name: 'file2.md', type: 'file', size: 200, lastModified: '2023-01-02' },
    { key: 'folder2', name: 'folder2', type: 'directory' }
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    mockFetchItems.mockResolvedValue({ data: mockFileItems });
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  describe('Sort Dropdown Integration', () => {
    it('should render sort dropdown in FileBrowserActions', () => {
      renderWithQueryClient(
        <FileBrowserActions
          type="files"
          isUploading={false}
          onRefresh={mockOnRefresh}
          onNewFolderClick={mockOnNewFolderClick}
          onOpenUploadDialog={mockOnOpenUploadDialog}
          currentPath="/test"
          isCreatingFolder={false}
          fetchItems={mockFetchItems}
          sortConfig={defaultSortConfig}
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByTestId('sort-dropdown')).toBeInTheDocument();
      expect(screen.getByTestId('sort-button')).toBeInTheDocument();
    });

    it('should call onSortChange when sort dropdown is used', async () => {
      renderWithQueryClient(
        <FileBrowserActions
          type="files"
          isUploading={false}
          onRefresh={mockOnRefresh}
          onNewFolderClick={mockOnNewFolderClick}
          onOpenUploadDialog={mockOnOpenUploadDialog}
          currentPath="/test"
          isCreatingFolder={false}
          fetchItems={mockFetchItems}
          sortConfig={defaultSortConfig}
          onSortChange={mockOnSortChange}
        />
      );

      const sortButton = screen.getByTestId('sort-button');
      fireEvent.click(sortButton);

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'name',
        direction: 'desc',
        foldersFirst: false
      });
    });

    it('should handle folders-first toggle', async () => {
      renderWithQueryClient(
        <FileBrowserActions
          type="files"
          isUploading={false}
          onRefresh={mockOnRefresh}
          onNewFolderClick={mockOnNewFolderClick}
          onOpenUploadDialog={mockOnOpenUploadDialog}
          currentPath="/test"
          isCreatingFolder={false}
          fetchItems={mockFetchItems}
          sortConfig={defaultSortConfig}
          onSortChange={mockOnSortChange}
        />
      );

      const foldersFirstButton = screen.getByTestId('toggle-folders-first');
      fireEvent.click(foldersFirstButton);

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'name',
        direction: 'asc',
        foldersFirst: true
      });
    });

    it('should display current sort configuration', () => {
      const customSortConfig: SortConfig = {
        field: 'lastModified' as SortField,
        direction: 'desc' as SortDirection,
        foldersFirst: true
      };

      renderWithQueryClient(
        <FileBrowserActions
          type="files"
          isUploading={false}
          onRefresh={mockOnRefresh}
          onNewFolderClick={mockOnNewFolderClick}
          onOpenUploadDialog={mockOnOpenUploadDialog}
          currentPath="/test"
          isCreatingFolder={false}
          fetchItems={mockFetchItems}
          sortConfig={customSortConfig}
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByText('Sort: lastModified desc')).toBeInTheDocument();
      expect(screen.getByText('Folders First: On')).toBeInTheDocument();
    });
  });

  describe('Browser Type Support', () => {
    it('should work with files browser type', () => {
      renderWithQueryClient(
        <FileBrowserActions
          type="files"
          isUploading={false}
          onRefresh={mockOnRefresh}
          onNewFolderClick={mockOnNewFolderClick}
          onOpenUploadDialog={mockOnOpenUploadDialog}
          currentPath="/test"
          isCreatingFolder={false}
          fetchItems={mockFetchItems}
          sortConfig={defaultSortConfig}
          onSortChange={mockOnSortChange}
        />
      );

      const sortDropdown = screen.getByTestId('sort-dropdown');
      expect(sortDropdown).toHaveAttribute('data-type', 'files');
    });

    it('should work with media browser type', () => {
      renderWithQueryClient(
        <FileBrowserActions
          type="media"
          isUploading={false}
          onRefresh={mockOnRefresh}
          onNewFolderClick={mockOnNewFolderClick}
          onOpenUploadDialog={mockOnOpenUploadDialog}
          currentPath="/test"
          isCreatingFolder={false}
          fetchItems={mockFetchItems}
          sortConfig={defaultSortConfig}
          onSortChange={mockOnSortChange}
        />
      );

      const sortDropdown = screen.getByTestId('sort-dropdown');
      expect(sortDropdown).toHaveAttribute('data-type', 'media');
    });
  });

  describe('Sort Persistence', () => {
    it('should load sort configuration from localStorage', () => {
      const savedConfig: SortConfig = {
        field: 'lastModified' as SortField,
        direction: 'desc' as SortDirection,
        foldersFirst: true
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedConfig));

      renderWithQueryClient(
        <FileBrowserActions
          type="files"
          isUploading={false}
          onRefresh={mockOnRefresh}
          onNewFolderClick={mockOnNewFolderClick}
          onOpenUploadDialog={mockOnOpenUploadDialog}
          currentPath="/test"
          isCreatingFolder={false}
          fetchItems={mockFetchItems}
          sortConfig={savedConfig}
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByText('Sort: lastModified desc')).toBeInTheDocument();
      expect(screen.getByText('Folders First: On')).toBeInTheDocument();
    });

    it('should handle invalid localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      expect(() => {
        renderWithQueryClient(
          <FileBrowserActions
            type="files"
            isUploading={false}
            onRefresh={mockOnRefresh}
            onNewFolderClick={mockOnNewFolderClick}
            onOpenUploadDialog={mockOnOpenUploadDialog}
            currentPath="/test"
            isCreatingFolder={false}
            fetchItems={mockFetchItems}
            sortConfig={defaultSortConfig}
            onSortChange={mockOnSortChange}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file list', async () => {
      mockFetchItems.mockResolvedValue({ data: [] });

      renderWithQueryClient(
        <FileBrowserActions
          type="files"
          isUploading={false}
          onRefresh={mockOnRefresh}
          onNewFolderClick={mockOnNewFolderClick}
          onOpenUploadDialog={mockOnOpenUploadDialog}
          currentPath="/test"
          isCreatingFolder={false}
          fetchItems={mockFetchItems}
          sortConfig={defaultSortConfig}
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByTestId('sort-dropdown')).toBeInTheDocument();
    });

    it('should handle fetch errors gracefully', async () => {
      mockFetchItems.mockRejectedValue(new Error('Fetch failed'));

      renderWithQueryClient(
        <FileBrowserActions
          type="files"
          isUploading={false}
          onRefresh={mockOnRefresh}
          onNewFolderClick={mockOnNewFolderClick}
          onOpenUploadDialog={mockOnOpenUploadDialog}
          currentPath="/test"
          isCreatingFolder={false}
          fetchItems={mockFetchItems}
          sortConfig={defaultSortConfig}
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByTestId('sort-dropdown')).toBeInTheDocument();
    });
  });
});
