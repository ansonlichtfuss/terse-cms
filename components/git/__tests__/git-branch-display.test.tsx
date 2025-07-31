import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GitBranchDisplay } from '../git-branch-display';

// Mock dependencies
vi.mock('@/hooks/api/use-git-branches', () => ({
  useGitBranchesQuery: vi.fn(),
  useSwitchGitBranchMutation: vi.fn()
}));

vi.mock('@/components/ui/confirmation-dialog', () => ({
  ConfirmationDialog: ({ open, title, description, onConfirm, onOpenChange }: ConfirmationDialogProps) =>
    open ? (
      <div data-testid="confirmation-dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={onConfirm} data-testid="confirm-button">
          OK
        </button>
        <button onClick={() => onOpenChange(false)} data-testid="close-button">
          Close
        </button>
      </div>
    ) : null
}));

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
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

describe('GitBranchDisplay', () => {
  let mockUseGitBranchesQuery: vi.MockedFunction<() => unknown>;
  let mockUseSwitchGitBranchMutation: vi.MockedFunction<() => unknown>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockUseGitBranchesQuery = vi.fn();
    mockUseSwitchGitBranchMutation = vi.fn();

    const { useGitBranchesQuery, useSwitchGitBranchMutation } = vi.mocked(
      await import('@/hooks/api/use-git-branches')
    );

    useGitBranchesQuery.mockImplementation(mockUseGitBranchesQuery);
    useSwitchGitBranchMutation.mockImplementation(mockUseSwitchGitBranchMutation);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render current branch name and dropdown menu', () => {
    // Arrange
    const mockBranches = [
      { name: 'main', isCurrent: true },
      { name: 'feature/new-component', isCurrent: false }
    ];

    mockUseGitBranchesQuery.mockReturnValue({
      data: mockBranches,
      isLoading: false,
      error: null
    });
    mockUseSwitchGitBranchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false
    });

    // Act
    render(<GitBranchDisplay />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    // Arrange
    mockUseGitBranchesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    });
    mockUseSwitchGitBranchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false
    });

    // Act
    render(<GitBranchDisplay />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    // Arrange
    const mockError = new Error('Failed to fetch branches');
    mockUseGitBranchesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError
    });
    mockUseSwitchGitBranchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false
    });

    // Act
    render(<GitBranchDisplay />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByText(/Error loading branches/)).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch branches/)).toBeInTheDocument();
  });

  it('should handle branch switching', async () => {
    // Arrange
    const mockBranches = [
      { name: 'main', isCurrent: true },
      { name: 'feature/test', isCurrent: false }
    ];

    const mockMutate = vi.fn();
    mockUseGitBranchesQuery.mockReturnValue({
      data: mockBranches,
      isLoading: false,
      error: null
    });
    mockUseSwitchGitBranchMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false
    });

    const user = userEvent.setup();

    // Act
    render(<GitBranchDisplay />, { wrapper: createWrapper() });

    const dropdownTrigger = screen.getByRole('button');
    await user.click(dropdownTrigger);

    const featureBranch = screen.getByText('feature/test');
    await user.click(featureBranch);

    // Assert
    expect(mockMutate).toHaveBeenCalledWith('feature/test', expect.any(Object));
  });

  it('should display error dialog when branch switching fails', async () => {
    // Arrange
    const mockBranches = [
      { name: 'main', isCurrent: true },
      { name: 'feature/test', isCurrent: false }
    ];

    const mockMutate = vi.fn((branchName, { onError }) => {
      onError(new Error('Branch switch failed'));
    });

    mockUseGitBranchesQuery.mockReturnValue({
      data: mockBranches,
      isLoading: false,
      error: null
    });
    mockUseSwitchGitBranchMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false
    });

    const user = userEvent.setup();

    // Act
    render(<GitBranchDisplay />, { wrapper: createWrapper() });

    const dropdownTrigger = screen.getByRole('button');
    await user.click(dropdownTrigger);

    const featureBranch = screen.getByText('feature/test');
    await user.click(featureBranch);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
    });
    expect(screen.getByText('Cannot switch branch')).toBeInTheDocument();
    expect(screen.getByText('Branch switch failed')).toBeInTheDocument();
  });

  it('should disable buttons when loading or switching', () => {
    // Arrange
    const mockBranches = [{ name: 'main', isCurrent: true }];

    mockUseGitBranchesQuery.mockReturnValue({
      data: mockBranches,
      isLoading: false,
      error: null
    });
    mockUseSwitchGitBranchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: true // Currently switching
    });

    // Act
    render(<GitBranchDisplay />, { wrapper: createWrapper() });

    // Assert
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should show Unknown Branch when no current branch is found', () => {
    // Arrange
    const mockBranches = [
      { name: 'feature1', isCurrent: false },
      { name: 'feature2', isCurrent: false }
    ];

    mockUseGitBranchesQuery.mockReturnValue({
      data: mockBranches,
      isLoading: false,
      error: null
    });
    mockUseSwitchGitBranchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false
    });

    // Act
    render(<GitBranchDisplay />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByText('Unknown Branch')).toBeInTheDocument();
  });

  it('should handle empty branches list', () => {
    // Arrange
    mockUseGitBranchesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });
    mockUseSwitchGitBranchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false
    });

    // Act
    render(<GitBranchDisplay />, { wrapper: createWrapper() });

    // Assert
    expect(screen.getByText('Unknown Branch')).toBeInTheDocument();
  });
});