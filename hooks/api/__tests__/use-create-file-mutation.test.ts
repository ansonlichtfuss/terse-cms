import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

import { useCreateFileMutation } from '../use-create-file-mutation';

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

describe('useCreateFileMutation', () => {
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

  describe('Successful file creation', () => {
    it('should successfully create a file with content', async () => {
      // Arrange
      const testFilePath = '/test/new-file.md';
      const testContent = '# New File\n\nThis is a new file.';
      
      mockApiClient.request.mockResolvedValueOnce(undefined);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateFileMutation(), { wrapper });

      // Act
      result.current.mutate({ filePath: testFilePath, content: testContent });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.request).toHaveBeenCalledWith(
        'POST',
        '/api/files',
        { path: testFilePath, content: testContent }
      );
      
      expect(mockInvalidateFiles).toHaveBeenCalled();
    });

    it('should create a file without content (empty file)', async () => {
      // Arrange
      const testFilePath = '/test/empty-file.md';
      
      mockApiClient.request.mockResolvedValueOnce(undefined);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateFileMutation(), { wrapper });

      // Act
      result.current.mutate({ filePath: testFilePath });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.request).toHaveBeenCalledWith(
        'POST',
        '/api/files',
        { path: testFilePath, content: '' }
      );
    });

    it('should handle special characters in file path and content', async () => {
      // Arrange
      const testFilePath = '/test/файл с пробелами & спецсимволы.md';
      const testContent = '# Test with émojis 🚀\n\n**Bold** _italic_ `code`';
      
      mockApiClient.request.mockResolvedValueOnce(undefined);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateFileMutation(), { wrapper });

      // Act
      result.current.mutate({ filePath: testFilePath, content: testContent });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.request).toHaveBeenCalledWith(
        'POST',
        '/api/files',
        { path: testFilePath, content: testContent }
      );
    });
  });

  describe('Error handling', () => {
    it('should handle API errors and not invalidate cache on failure', async () => {
      // Arrange
      const testFilePath = '/test/file.md';
      const testContent = 'Test content';
      const apiError = new Error('API request failed');
      
      mockApiClient.request.mockRejectedValueOnce(apiError);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateFileMutation(), { wrapper });

      // Act
      result.current.mutate({ filePath: testFilePath, content: testContent });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(apiError);
      expect(mockInvalidateFiles).not.toHaveBeenCalled();
    });
  });


  describe('Hook state management', () => {
    it('should properly manage loading state', async () => {
      // Arrange
      const testFilePath = '/test/file.md';
      const testContent = 'Test content';
      
      // Create a promise we can control
      let resolvePromise: (value: any) => void;
      const controlledPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockApiClient.request.mockReturnValueOnce(controlledPromise);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateFileMutation(), { wrapper });

      // Initially not loading
      expect(result.current.isPending).toBe(false);

      // Act - Start mutation
      result.current.mutate({ filePath: testFilePath, content: testContent });

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
      const testFilePath = '/test/file.md';
      const testContent = 'Test content';
      
      mockApiClient.request.mockResolvedValueOnce(undefined);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateFileMutation(), { wrapper });

      // Act
      result.current.mutate({ filePath: testFilePath, content: testContent });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.variables).toEqual({
        filePath: testFilePath,
        content: testContent
      });
    });
  });
});