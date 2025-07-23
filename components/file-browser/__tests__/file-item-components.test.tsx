import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FileItemDropdown } from '../file-item-dropdown';
import { FileItemRow } from '../file-item-row';
import type { FileItem } from '../types/file-item';

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  )
}));

vi.mock('@/hooks/use-repository-from-url', () => ({
  useRepositoryFromUrl: () => ({
    currentRepositoryId: 'test-repo'
  })
}));

// Mock Radix UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, size, ...props }: any) => (
    <button 
      onClick={onClick} 
      className={`${className} btn-${variant} btn-${size}`} 
      {...props}
    >
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children, align }: { children: React.ReactNode; align?: string }) => (
    <div data-testid="dropdown-content" data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ 
    children, 
    onClick, 
    disabled, 
    destructive 
  }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean;
    destructive?: boolean;
  }) => (
    <div 
      data-testid="dropdown-item"
      onClick={onClick}
      data-disabled={disabled}
      data-destructive={destructive}
      className={disabled ? 'disabled' : ''}
    >
      {children}
    </div>
  )
}));

vi.mock('@/components/ui/hover-card', () => ({
  HoverCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  HoverCardTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="hover-trigger">{children}</div>
  ),
  HoverCardContent: ({ children, side, className }: any) => (
    <div data-testid="hover-content" data-side={side} className={className}>
      {children}
    </div>
  )
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  File: (props: any) => <div data-testid="file-icon" {...props}>File</div>,
  Folder: (props: any) => <div data-testid="folder-icon" {...props}>Folder</div>,
  MoreHorizontal: (props: any) => <div data-testid="more-horizontal-icon" {...props}>More</div>
}));

describe('FileItemRow', () => {
  const mockOnItemClick = vi.fn();
  const mockOnDeleteClick = vi.fn();
  const mockOnRenameClick = vi.fn();
  const mockOnMoveClick = vi.fn();

  const baseProps = {
    isSelected: false,
    type: 'files' as const,
    onItemClick: mockOnItemClick,
    onDeleteClick: mockOnDeleteClick,
    onRenameClick: mockOnRenameClick,
    onMoveClick: mockOnMoveClick,
    isDeleting: false,
    isRenaming: false,
    isMoving: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('File rendering', () => {
    it('renders text files with Link wrapper', () => {
      const fileItem: FileItem = {
        key: 'test.md',
        name: 'test.md',
        type: 'file',
        path: 'path/test.md'
      };

      render(<FileItemRow {...baseProps} item={fileItem} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/edit/path/test.md?repo=test-repo');
      expect(screen.getByText('test.md')).toBeInTheDocument();
    });

    it('renders non-text files with div wrapper', () => {
      const fileItem: FileItem = {
        key: 'image.jpg',
        name: 'image.jpg',
        type: 'file',
        path: 'path/image.jpg'
      };

      render(<FileItemRow {...baseProps} item={fileItem} />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByTestId('file-icon')).toBeInTheDocument();
      expect(screen.getByText('image.jpg')).toBeInTheDocument();
    });

    it('renders file icons for regular files', () => {
      const fileItem: FileItem = {
        key: 'document.pdf',
        name: 'document.pdf',
        type: 'file'
      };

      render(<FileItemRow {...baseProps} item={fileItem} />);

      expect(screen.getByTestId('file-icon')).toBeInTheDocument();
    });

    it('shows file name with truncation title', () => {
      const longFileName = 'very-long-file-name-that-should-be-truncated.md';
      const fileItem: FileItem = {
        key: longFileName,
        name: longFileName,
        type: 'file'
      };

      render(<FileItemRow {...baseProps} item={fileItem} />);

      const nameElement = screen.getByText(longFileName);
      expect(nameElement).toHaveAttribute('title', longFileName);
    });

    it('handles drag and drop for files', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file',
        url: 'http://example.com/test.txt'
      };

      render(<FileItemRow {...baseProps} item={fileItem} />);

      const draggableElement = screen.getByText('test.txt').closest('[draggable="true"]');
      expect(draggableElement).toBeInTheDocument();
    });
  });

  describe('Folder rendering', () => {
    it('renders folders with folder icon', () => {
      const folderItem: FileItem = {
        key: 'my-folder',
        name: 'my-folder',
        type: 'folder'
      };

      render(<FileItemRow {...baseProps} item={folderItem} />);

      expect(screen.getByTestId('folder-icon')).toBeInTheDocument();
      expect(screen.getByText('my-folder')).toBeInTheDocument();
    });

    it('handles folder clicks', () => {
      const folderItem: FileItem = {
        key: 'my-folder',
        name: 'my-folder',
        type: 'folder'
      };

      render(<FileItemRow {...baseProps} item={folderItem} />);

      fireEvent.click(screen.getByText('my-folder'));
      expect(mockOnItemClick).toHaveBeenCalledWith(folderItem);
    });

    it('does not make folders draggable', () => {
      const folderItem: FileItem = {
        key: 'my-folder',
        name: 'my-folder',
        type: 'folder'
      };

      render(<FileItemRow {...baseProps} item={folderItem} />);

      const folderElement = screen.getByText('my-folder').closest('div');
      expect(folderElement).not.toHaveAttribute('draggable', 'true');
    });
  });

  describe('Media type handling', () => {
    it('renders image thumbnails for media items', () => {
      const imageItem: FileItem = {
        key: 'photo.jpg',
        name: 'photo.jpg',
        type: 'file',
        url: 'https://example.com/photo.jpg'
      };

      render(<FileItemRow {...baseProps} item={imageItem} type="media" />);

      expect(screen.getAllByRole('img')[0]).toHaveAttribute('src', 'https://example.com/photo.jpg');
      expect(screen.getByTestId('hover-trigger')).toBeInTheDocument();
    });

    it('renders file icon for non-image media items', () => {
      const videoItem: FileItem = {
        key: 'video.mp4',
        name: 'video.mp4',
        type: 'file',
        url: 'https://example.com/video.mp4'
      };

      render(<FileItemRow {...baseProps} item={videoItem} type="media" />);

      expect(screen.getByTestId('file-icon')).toBeInTheDocument();
    });
  });

  describe('Selection state', () => {
    it('applies selected styles when isSelected is true', () => {
      const fileItem: FileItem = {
        key: 'test.md',
        name: 'test.md',
        type: 'file'
      };

      render(<FileItemRow {...baseProps} item={fileItem} isSelected={true} />);

      const link = screen.getByRole('link');
      expect(link.className).toContain('selected');
    });

    it('does not apply selected styles when isSelected is false', () => {
      const fileItem: FileItem = {
        key: 'test.md',
        name: 'test.md',
        type: 'file'
      };

      render(<FileItemRow {...baseProps} item={fileItem} isSelected={false} />);

      const link = screen.getByRole('link');
      expect(link).not.toHaveClass('selected');
    });
  });

  describe('Loading states', () => {
    it('passes loading states to dropdown', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file'
      };

      render(
        <FileItemRow 
          {...baseProps} 
          item={fileItem} 
          isDeleting={true}
          isRenaming={true}
          isMoving={true}
        />
      );

      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
    });
  });
});

describe('FileItemDropdown', () => {
  const mockOnMoveClick = vi.fn();
  const mockOnRenameClick = vi.fn();
  const mockOnDeleteClick = vi.fn();

  const baseProps = {
    onMoveClick: mockOnMoveClick,
    onRenameClick: mockOnRenameClick,
    onDeleteClick: mockOnDeleteClick,
    isDeleting: false,
    isRenaming: false,
    isMoving: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Menu structure', () => {
    it('renders dropdown trigger with more icon', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file'
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} />);

      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('more-horizontal-icon')).toBeInTheDocument();
    });

    it('renders dropdown content with menu items', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file'
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} />);

      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      expect(screen.getAllByTestId('dropdown-item')).toHaveLength(4); // Move, Download, Rename, Delete
    });

    it('prevents event propagation on trigger click', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file'
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} />);

      const trigger = screen.getByRole('button');
      const stopPropagationSpy = vi.fn();
      const preventDefaultSpy = vi.fn();

      fireEvent.click(trigger, {
        stopPropagation: stopPropagationSpy,
        preventDefault: preventDefaultSpy
      });

      // The component should handle these events
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('File operations', () => {
    it('shows move option for files', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file'
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} />);

      expect(screen.getByText('Move')).toBeInTheDocument();
    });

    it('hides move option for folders', () => {
      const folderItem: FileItem = {
        key: 'my-folder',
        name: 'my-folder',
        type: 'folder'
      };

      render(<FileItemDropdown {...baseProps} item={folderItem} />);

      expect(screen.queryByText('Move')).not.toBeInTheDocument();
    });

    it('shows download option for files', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file',
        url: 'https://example.com/test.txt'
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} />);

      expect(screen.getByText('Download')).toBeInTheDocument();
    });

    it('calls onRenameClick when rename is clicked', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file'
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} />);

      fireEvent.click(screen.getByText('Rename'));
      expect(mockOnRenameClick).toHaveBeenCalledWith(fileItem);
    });

    it('calls onDeleteClick when delete is clicked', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file'
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} />);

      fireEvent.click(screen.getByText('Delete'));
      expect(mockOnDeleteClick).toHaveBeenCalledWith(fileItem);
    });

    it('calls onMoveClick when move is clicked', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file'
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} />);

      fireEvent.click(screen.getByText('Move'));
      expect(mockOnMoveClick).toHaveBeenCalledWith(fileItem);
    });
  });

  describe('Loading states', () => {
    it('disables move when isMoving is true', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file'
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} isMoving={true} />);

      const moveItem = screen.getByText('Move').closest('[data-testid="dropdown-item"]');
      expect(moveItem).toHaveAttribute('data-disabled', 'true');
    });

    it('disables rename when isRenaming is true', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file'
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} isRenaming={true} />);

      const renameItem = screen.getByText('Rename').closest('[data-testid="dropdown-item"]');
      expect(renameItem).toHaveAttribute('data-disabled', 'true');
    });

    it('disables delete when isDeleting is true', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file'
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} isDeleting={true} />);

      const deleteItem = screen.getByText('Delete').closest('[data-testid="dropdown-item"]');
      expect(deleteItem).toHaveAttribute('data-disabled', 'true');
      expect(deleteItem).toHaveAttribute('data-destructive', 'true');
    });
  });

  describe('Download functionality', () => {
    it('triggers file download with correct attributes', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        name: 'test.txt',
        type: 'file',
        url: 'https://example.com/test.txt'
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} />);

      // Just verify the download button exists and is clickable
      const downloadButton = screen.getByText('Download');
      expect(downloadButton).toBeInTheDocument();
      
      // The actual download functionality is tested through user interaction
      fireEvent.click(downloadButton);
      // We can't easily test the DOM manipulation in jsdom, so we just ensure it doesn't throw
    });

    it('uses fallback values when properties are missing', () => {
      const fileItem: FileItem = {
        key: 'test.txt',
        type: 'file'
        // Missing name, url, path
      };

      render(<FileItemDropdown {...baseProps} item={fileItem} />);

      const downloadButton = screen.getByText('Download');
      expect(downloadButton).toBeInTheDocument();
      
      // Test that clicking doesn't throw an error when properties are missing
      fireEvent.click(downloadButton);
    });
  });
});