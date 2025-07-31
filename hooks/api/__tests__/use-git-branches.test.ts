import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGitBranchesQuery, useSwitchGitBranchMutation } from '../use-git-branches';

// Mock dependencies
vi.mock('@/hooks/use-repository-from-url', () => ({
  useRepositoryFromUrl: vi.fn(() => ({
    currentRepositoryId: 'test-repo-123'
  }))
}));

vi.mock('../shared', () => ({
  ApiClient: vi.fn(),
  useApiClient: vi.fn(),
  useStandardInvalidation: vi.fn(() => ({
    invalidateGit: vi.fn()
  })),
  queryKeys: {
    gitBranches: (repoId: string) => ['gitBranches', repoId]
  }
}));

// Create a test wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useGitBranchesQuery', () => {
  let mockApiClient: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockApiClient = {
      request: vi.fn(),
      getRepositoryId: vi.fn(() => 'test-repo-123')
    };

    const { useApiClient } = vi.mocked(await import('../shared'));
    useApiClient.mockReturnValue(mockApiClient);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch git branches and identify current branch', async () => {
    // Arrange
    const mockBranches = [
      { name: 'main', isCurrent: true },
      { name: 'feature/new-component', isCurrent: false },
      { name: 'bugfix/urgent-fix', isCurrent: false }
    ];
    mockApiClient.request.mockResolvedValueOnce({ branches: mockBranches });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGitBranchesQuery(), { wrapper });

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBranches);
    expect(mockApiClient.request).toHaveBeenCalledWith('GET', '/api/git/branches');
  });

  it('should handle empty branches list', async () => {
    // Arrange
    mockApiClient.request.mockResolvedValueOnce({ branches: [] });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGitBranchesQuery(), { wrapper });

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('should handle git branches API errors', async () => {
    // Arrange
    const apiError = new Error('Git branches fetch failed');
    mockApiClient.request.mockRejectedValueOnce(apiError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGitBranchesQuery(), { wrapper });

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(apiError);
  });

  it('should handle repository ID changes', async () => {
    // Arrange - Mock different repository
    const { useRepositoryFromUrl } = vi.mocked(await import('@/hooks/use-repository-from-url'));
    useRepositoryFromUrl.mockReturnValueOnce({
      currentRepositoryId: 'different-repo-456'
    });

    mockApiClient.getRepositoryId.mockReturnValue('different-repo-456');

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGitBranchesQuery(), { wrapper });

    // Act
    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    });

    // Assert - Check that the query was called with the correct repository ID
    expect(mockApiClient.getRepositoryId).toHaveBeenCalled();
  });
});

describe('useSwitchGitBranchMutation', () => {
  let mockApiClient: any;
  let mockInvalidateGit: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockApiClient = {
      request: vi.fn(),
      getRepositoryId: vi.fn(() => 'test-repo-123')
    };

    const { useApiClient, useStandardInvalidation } = vi.mocked(await import('../shared'));
    useApiClient.mockReturnValue(mockApiClient);

    mockInvalidateGit = vi.fn();
    useStandardInvalidation.mockReturnValue({
      invalidateGit: mockInvalidateGit
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully switch to a different branch', async () => {
    // Arrange
    const targetBranch = 'feature/new-component';
    mockApiClient.request.mockResolvedValueOnce(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSwitchGitBranchMutation(), { wrapper });

    // Act
    result.current.mutate(targetBranch);

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.request).toHaveBeenCalledWith('POST', '/api/git/switch-branch', {
      branchName: targetBranch
    });
    expect(mockInvalidateGit).toHaveBeenCalledTimes(1);
  });

  it('should handle branch switching errors', async () => {
    // Arrange
    const targetBranch = 'non-existent-branch';
    const apiError = new Error('Branch does not exist');
    mockApiClient.request.mockRejectedValueOnce(apiError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSwitchGitBranchMutation(), { wrapper });

    // Act
    result.current.mutate(targetBranch);

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(apiError);
    expect(mockInvalidateGit).not.toHaveBeenCalled();
  });

  it('should properly manage loading state during branch switch', async () => {
    // Arrange
    const targetBranch = 'feature/test';
    let resolvePromise: (value: any) => void;
    const controlledPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockApiClient.request.mockReturnValueOnce(controlledPromise);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSwitchGitBranchMutation(), { wrapper });

    // Initially not loading
    expect(result.current.isPending).toBe(false);

    // Act - Start mutation
    result.current.mutate(targetBranch);

    // Should be loading
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Resolve the promise
    resolvePromise!(undefined);

    // Should no longer be loading
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });
  });
});