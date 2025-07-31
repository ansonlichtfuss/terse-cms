import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GitCommitDialog } from '../git-commit-dialog';

// Mock dependencies
vi.mock('@/context/git-status-context', () => ({
  useGitStatus: vi.fn()
}));

// Mock the actual component at the correct path
vi.mock('../file-tree-dialog', () => ({
  FileTreeDialog: ({ open, title, children, footerActions }: FileTreeDialogProps) =>
    open ? (
      <div data-testid="file-tree-dialog">
        <h2>{title}</h2>
        <div>{children}</div>
        <div data-testid="footer-actions">{footerActions}</div>
      </div>
    ) : null
}));

interface FileTreeDialogProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  footerActions: React.ReactNode;
}

// Create a test wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('GitCommitDialog', () => {
  let mockUseGitStatus: vi.MockedFunction<() => unknown>;

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onCommit: vi.fn(),
    isCommitting: false
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockUseGitStatus = vi.fn();

    const { useGitStatus } = vi.mocked(await import('@/context/git-status-context'));
    useGitStatus.mockImplementation(mockUseGitStatus);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render commit dialog with commit message input', () => {
    // Arrange
    const mockModifiedFiles = ['file1.md', 'file2.txt'];
    mockUseGitStatus.mockReturnValue({
      modifiedFiles: mockModifiedFiles,
      isLoading: false,
      error: null
    });

    // Act
    render(<GitCommitDialog {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByTestId('file-tree-dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Commit Changes' })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/CMS: Updated files at/)).toBeInTheDocument();
  });

  it('should handle commit message changes', async () => {
    // Arrange
    mockUseGitStatus.mockReturnValue({
      modifiedFiles: ['test.md'],
      isLoading: false,
      error: null
    });

    const user = userEvent.setup();

    // Act
    render(<GitCommitDialog {...defaultProps} />, { wrapper: createWrapper() });

    const input = screen.getByDisplayValue(/CMS: Updated files at/) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, 'Custom commit message');

    // Assert
    expect(screen.getByDisplayValue('Custom commit message')).toBeInTheDocument();
  });

  it('should call onCommit when commit button is clicked', async () => {
    // Arrange
    const mockOnCommit = vi.fn();
    mockUseGitStatus.mockReturnValue({
      modifiedFiles: ['test.md'],
      isLoading: false,
      error: null
    });

    const user = userEvent.setup();

    // Act
    render(<GitCommitDialog {...defaultProps} onCommit={mockOnCommit} />, { wrapper: createWrapper() });

    const input = screen.getByDisplayValue(/CMS: Updated files at/) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, 'Test commit message');

    const commitButton = screen.getByRole('button', { name: 'Commit Changes' });
    await user.click(commitButton);

    // Assert
    expect(mockOnCommit).toHaveBeenCalledWith('Test commit message');
  });

  it('should call onOpenChange when cancel button is clicked', async () => {
    // Arrange
    const mockOnOpenChange = vi.fn();
    mockUseGitStatus.mockReturnValue({
      modifiedFiles: ['test.md'],
      isLoading: false,
      error: null
    });

    const user = userEvent.setup();

    // Act
    render(<GitCommitDialog {...defaultProps} onOpenChange={mockOnOpenChange} />, { wrapper: createWrapper() });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    // Assert
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show committing state when isCommitting is true', () => {
    // Arrange
    mockUseGitStatus.mockReturnValue({
      modifiedFiles: ['test.md'],
      isLoading: false,
      error: null
    });

    // Act
    render(<GitCommitDialog {...defaultProps} isCommitting={true} />, { wrapper: createWrapper() });

    // Assert
    const commitButton = screen.getByRole('button', { name: 'Committing...' });
    expect(commitButton).toBeDisabled();
  });

  it('should handle empty modified files list', () => {
    // Arrange
    mockUseGitStatus.mockReturnValue({
      modifiedFiles: [],
      isLoading: false,
      error: null
    });

    // Act
    render(<GitCommitDialog {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByTestId('file-tree-dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Commit Changes' })).toBeInTheDocument();
  });

  it('should handle undefined modified files', () => {
    // Arrange
    mockUseGitStatus.mockReturnValue({
      modifiedFiles: undefined,
      isLoading: true,
      error: null
    });

    // Act
    render(<GitCommitDialog {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByTestId('file-tree-dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Commit Changes' })).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    // Arrange
    mockUseGitStatus.mockReturnValue({
      modifiedFiles: ['test.md'],
      isLoading: false,
      error: null
    });

    // Act
    render(<GitCommitDialog {...defaultProps} open={false} />, { wrapper: createWrapper() });

    // Assert
    expect(screen.queryByTestId('file-tree-dialog')).not.toBeInTheDocument();
  });

  it('should generate default commit message with current timestamp', () => {
    // Arrange
    const mockDate = new Date('2024-01-15T10:30:00Z');
    vi.setSystemTime(mockDate);

    mockUseGitStatus.mockReturnValue({
      modifiedFiles: ['test.md'],
      isLoading: false,
      error: null
    });

    // Act
    render(<GitCommitDialog {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    const input = screen.getByDisplayValue(/CMS: Updated files at/);
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toContain('CMS: Updated files at');

    vi.useRealTimers();
  });

  it('should handle git status loading state', () => {
    // Arrange
    mockUseGitStatus.mockReturnValue({
      modifiedFiles: undefined,
      isLoading: true,
      error: null
    });

    // Act
    render(<GitCommitDialog {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByTestId('file-tree-dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Commit Changes' })).toBeInTheDocument();
  });

  it('should handle git status error', () => {
    // Arrange
    mockUseGitStatus.mockReturnValue({
      modifiedFiles: undefined,
      isLoading: false,
      error: new Error('Git status failed')
    });

    // Act
    render(<GitCommitDialog {...defaultProps} />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByTestId('file-tree-dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Commit Changes' })).toBeInTheDocument();
  });
});