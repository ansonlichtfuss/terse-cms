import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

import { useDeleteFileMutation } from '../use-delete-file-mutation';

// Mock dependencies
vi.mock('@/hooks/use-repository-from-url', () => ({
  useRepositoryFromUrl: vi.fn(() => ({
    currentRepositoryId: 'test-repo-123'
  }))
}));

vi.mock('../shared', () => ({
  ApiClient: vi.fn(),
  useApiClient: vi.fn(() => ({
    request: vi.fn()
  })),
  useStandardInvalidation: vi.fn(() => ({
    invalidateFiles: vi.fn()
  }))
}));

// Create a test wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useDeleteFileMutation', () => {
  let mockApiClient: any;
  let mockInvalidateFiles: any;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup mock API client
    mockApiClient = {
      request: vi.fn()
    };
    
    // Get mock instances and configure them
    const { useApiClient, useStandardInvalidation } = vi.mocked(await import('../shared'));
    useApiClient.mockReturnValue(mockApiClient);
    
    mockInvalidateFiles = vi.fn();
    useStandardInvalidation.mockReturnValue({
      invalidateFiles: mockInvalidateFiles
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful file deletion', () => {
    it('should successfully delete a file', async () => {
      // Arrange
      const testPath = '/test/file-to-delete.md';
      
      mockApiClient.request.mockResolvedValueOnce(undefined);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteFileMutation(), { wrapper });

      // Act
      result.current.mutate({ path: testPath });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.request).toHaveBeenCalledWith(
        'DELETE',
        '/api/files',
        { path: testPath }
      );
      
      expect(mockInvalidateFiles).toHaveBeenCalled();
    });

    it('should handle special characters in file path', async () => {
      // Arrange
      const testPath = '/test/файл с пробелами & спецсимволы.md';
      
      mockApiClient.request.mockResolvedValueOnce(undefined);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteFileMutation(), { wrapper });

      // Act
      result.current.mutate({ path: testPath });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.request).toHaveBeenCalledWith(
        'DELETE',
        '/api/files',
        { path: testPath }
      );
    });

  });



  describe('Hook state management', () => {
    it('should properly manage loading state', async () => {
      // Arrange
      const testPath = '/test/file.md';
      
      // Create a promise we can control
      let resolvePromise: (value: any) => void;
      const controlledPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockApiClient.request.mockReturnValueOnce(controlledPromise);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteFileMutation(), { wrapper });

      // Initially not loading
      expect(result.current.isPending).toBe(false);

      // Act - Start mutation
      result.current.mutate({ path: testPath });

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
      
      mockApiClient.request.mockResolvedValueOnce(undefined);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteFileMutation(), { wrapper });

      // Act
      result.current.mutate({ path: testPath });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.variables).toEqual({
        path: testPath
      });
    });

    it('should handle API errors and not invalidate cache on failure', async () => {
      // Arrange
      const testPath = '/test/file.md';
      const apiError = new Error('API request failed');
      
      mockApiClient.request.mockRejectedValueOnce(apiError);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteFileMutation(), { wrapper });

      // Act
      result.current.mutate({ path: testPath });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(apiError);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isPending).toBe(false);
      expect(mockInvalidateFiles).not.toHaveBeenCalled();
    });
  });
});