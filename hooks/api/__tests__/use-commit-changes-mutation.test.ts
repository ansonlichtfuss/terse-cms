import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCommitChangesMutation } from '../use-commit-changes-mutation';

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
  }))
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

describe('useCommitChangesMutation', () => {
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

  it('should successfully commit changes with valid message', async () => {
    // Arrange
    const commitMessage = 'Add new feature implementation';
    mockApiClient.request.mockResolvedValueOnce(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCommitChangesMutation(), { wrapper });

    // Act
    result.current.mutate(commitMessage);

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.request).toHaveBeenCalledWith('POST', '/api/git/commit', {
      message: commitMessage
    });
    expect(mockInvalidateGit).toHaveBeenCalledTimes(1);
  });

  it('should handle empty commit message', async () => {
    // Arrange
    const commitMessage = '';
    mockApiClient.request.mockResolvedValueOnce(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCommitChangesMutation(), { wrapper });

    // Act
    result.current.mutate(commitMessage);

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.request).toHaveBeenCalledWith('POST', '/api/git/commit', {
      message: commitMessage
    });
  });

  it('should handle commit API errors', async () => {
    // Arrange
    const commitMessage = 'Test commit';
    const apiError = new Error('Git commit failed');
    mockApiClient.request.mockRejectedValueOnce(apiError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCommitChangesMutation(), { wrapper });

    // Act
    result.current.mutate(commitMessage);

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(apiError);
    expect(mockInvalidateGit).not.toHaveBeenCalled();
  });

  it('should properly manage loading state during commit', async () => {
    // Arrange
    const commitMessage = 'Test commit';
    let resolvePromise: (value: any) => void;
    const controlledPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockApiClient.request.mockReturnValueOnce(controlledPromise);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCommitChangesMutation(), { wrapper });

    // Initially not loading
    expect(result.current.isPending).toBe(false);

    // Act - Start mutation
    result.current.mutate(commitMessage);

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

  it('should work without repository ID', async () => {
    // Arrange - Mock no repository context
    const { useRepositoryFromUrl } = vi.mocked(await import('@/hooks/use-repository-from-url'));
    useRepositoryFromUrl.mockReturnValueOnce({
      currentRepositoryId: null
    });

    mockApiClient.getRepositoryId.mockReturnValue(null);

    const commitMessage = 'Test commit';
    mockApiClient.request.mockResolvedValueOnce(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCommitChangesMutation(), { wrapper });

    // Act
    result.current.mutate(commitMessage);

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockInvalidateGit).toHaveBeenCalledTimes(1);
  });
});