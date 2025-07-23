import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSaveFileMutation } from '../use-save-file-mutation';

// Mock dependencies
vi.mock('@/hooks/use-repository-from-url', () => ({
  useRepositoryFromUrl: vi.fn(() => ({
    currentRepositoryId: 'test-repo-123'
  }))
}));

vi.mock('../shared', () => ({
  ApiClient: vi.fn(),
  useQueryInvalidation: vi.fn(() => ({
    invalidateQuery: vi.fn()
  }))
}));

// Create a test wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      },
      mutations: {
        retry: false
      }
    }
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSaveFileMutation', () => {
  let mockApiClient: any;
  let mockInvalidateQuery: any;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock API client
    mockApiClient = {
      request: vi.fn()
    };

    // Get mock instances and configure them
    const { ApiClient, useQueryInvalidation } = vi.mocked(await import('../shared'));
    ApiClient.mockImplementation(() => mockApiClient);

    mockInvalidateQuery = vi.fn();
    useQueryInvalidation.mockReturnValue({
      invalidateQuery: mockInvalidateQuery
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful file save operations', () => {
    it('should successfully save a file with valid content', async () => {
      // Arrange
      const testPath = '/test/file.md';
      const testContent = '# Test Content\n\nThis is a test file.';

      mockApiClient.request.mockResolvedValueOnce(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSaveFileMutation(), { wrapper });

      // Act
      result.current.mutate({ path: testPath, content: testContent });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.request).toHaveBeenCalledWith('POST', '/api/files', {
        path: testPath,
        content: testContent
      });

      expect(mockInvalidateQuery).toHaveBeenCalledWith(['fileContent', testPath, 'test-repo-123']);
      expect(mockInvalidateQuery).toHaveBeenCalledWith(['gitStatus', 'test-repo-123']);
    });

    it('should handle special characters in file path and content', async () => {
      // Arrange
      const testPath = '/test/файл с пробелами & спецсимволы.md';
      const testContent = '# Test with émojis 🚀\n\n**Bold** _italic_ `code`';

      mockApiClient.request.mockResolvedValueOnce(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSaveFileMutation(), { wrapper });

      // Act
      result.current.mutate({ path: testPath, content: testContent });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.request).toHaveBeenCalledWith('POST', '/api/files', {
        path: testPath,
        content: testContent
      });
    });


    it('should handle empty content', async () => {
      // Arrange
      const testPath = '/test/empty-file.md';
      const testContent = '';

      mockApiClient.request.mockResolvedValueOnce(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSaveFileMutation(), { wrapper });

      // Act
      result.current.mutate({ path: testPath, content: testContent });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.request).toHaveBeenCalledWith('POST', '/api/files', {
        path: testPath,
        content: testContent
      });
    });
  });

  describe('Error handling', () => {
    it('should handle API errors and not invalidate cache on failure', async () => {
      // Arrange
      const testPath = '/test/file.md';
      const testContent = 'Test content';
      const apiError = new Error('API request failed');

      mockApiClient.request.mockRejectedValueOnce(apiError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSaveFileMutation(), { wrapper });

      // Act
      result.current.mutate({ path: testPath, content: testContent });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(apiError);
      expect(mockInvalidateQuery).not.toHaveBeenCalled();
    });
  });


  describe('Hook state management', () => {
    it('should properly manage loading state', async () => {
      // Arrange
      const testPath = '/test/file.md';
      const testContent = 'Test content';

      // Create a promise we can control
      let resolvePromise: (value: any) => void;
      const controlledPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockApiClient.request.mockReturnValueOnce(controlledPromise);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSaveFileMutation(), { wrapper });

      // Initially not loading
      expect(result.current.isPending).toBe(false);

      // Act - Start mutation
      result.current.mutate({ path: testPath, content: testContent });

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

    it('should properly handle mutation variables', async () => {
      // Arrange
      const testPath = '/test/file.md';
      const testContent = 'Test content';

      mockApiClient.request.mockResolvedValueOnce(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSaveFileMutation(), { wrapper });

      // Act
      result.current.mutate({ path: testPath, content: testContent });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.variables).toEqual({
        path: testPath,
        content: testContent
      });
    });
  });

  describe('Repository context integration', () => {
    it('should work without repository ID', async () => {
      // Arrange - Mock no repository context
      const { useRepositoryFromUrl } = vi.mocked(await import('@/hooks/use-repository-from-url'));
      useRepositoryFromUrl.mockReturnValueOnce({
        currentRepositoryId: null
      });

      const testPath = '/test/file.md';
      const testContent = 'Test content';

      mockApiClient.request.mockResolvedValueOnce(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSaveFileMutation(), { wrapper });

      // Act
      result.current.mutate({ path: testPath, content: testContent });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockInvalidateQuery).toHaveBeenCalledWith(['fileContent', testPath, null]);
      expect(mockInvalidateQuery).toHaveBeenCalledWith(['gitStatus', null]);
    });

    it('should use correct repository ID in cache invalidation', async () => {
      // Arrange - Mock different repository
      const { useRepositoryFromUrl } = vi.mocked(await import('@/hooks/use-repository-from-url'));
      useRepositoryFromUrl.mockReturnValueOnce({
        currentRepositoryId: 'different-repo-456'
      });

      const testPath = '/test/file.md';
      const testContent = 'Test content';

      mockApiClient.request.mockResolvedValueOnce(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSaveFileMutation(), { wrapper });

      // Act
      result.current.mutate({ path: testPath, content: testContent });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockInvalidateQuery).toHaveBeenCalledWith(['fileContent', testPath, 'different-repo-456']);
      expect(mockInvalidateQuery).toHaveBeenCalledWith(['gitStatus', 'different-repo-456']);
    });
  });
});
