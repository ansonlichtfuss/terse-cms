import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGitStatusQuery, useStageGitChangesMutation } from '../use-git-status';

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
    gitStatus: (repoId: string) => ['gitStatus', repoId]
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

describe('useGitStatusQuery', () => {
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

  it('should fetch git status and return modified files', async () => {
    // Arrange
    const mockModifiedFiles = ['file1.md', 'file2.txt', 'src/component.tsx'];
    mockApiClient.request
      .mockResolvedValueOnce(undefined) // POST /api/git/stage
      .mockResolvedValueOnce({ modifiedFiles: mockModifiedFiles }); // GET /api/git/status

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGitStatusQuery(), { wrapper });

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockModifiedFiles);
    expect(mockApiClient.request).toHaveBeenCalledWith('POST', '/api/git/stage', {});
    expect(mockApiClient.request).toHaveBeenCalledWith('GET', '/api/git/status');
  });

  it('should handle empty modified files list', async () => {
    // Arrange
    mockApiClient.request
      .mockResolvedValueOnce(undefined) // POST /api/git/stage
      .mockResolvedValueOnce({ modifiedFiles: [] }); // GET /api/git/status

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGitStatusQuery(), { wrapper });

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('should handle git status API errors', async () => {
    // Arrange
    const apiError = new Error('Git status failed');
    mockApiClient.request.mockRejectedValueOnce(apiError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useGitStatusQuery(), { wrapper });

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(apiError);
  });
});

describe('useStageGitChangesMutation', () => {
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

  it('should successfully stage git changes', async () => {
    // Arrange
    mockApiClient.request.mockResolvedValueOnce(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useStageGitChangesMutation(), { wrapper });

    // Act
    result.current.mutate();

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.request).toHaveBeenCalledWith('POST', '/api/git/stage', {});
    expect(mockInvalidateGit).toHaveBeenCalledTimes(1);
  });

  it('should handle staging errors', async () => {
    // Arrange
    const apiError = new Error('Git staging failed');
    mockApiClient.request.mockRejectedValueOnce(apiError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useStageGitChangesMutation(), { wrapper });

    // Act
    result.current.mutate();

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(apiError);
    expect(mockInvalidateGit).not.toHaveBeenCalled();
  });
});