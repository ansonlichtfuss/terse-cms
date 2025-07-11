import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '../route';

// Create mock functions
const mockGetDirectoryContents = vi.fn();

// Mock the FileOperations class
vi.mock('@/lib/api/files/file-operations', () => {
  return {
    FileOperations: vi.fn().mockImplementation(() => ({
      getDirectoryContents: mockGetDirectoryContents
    }))
  };
});

// Mock the shared file utils
vi.mock('@/lib/api/shared/file-utils', () => {
  return {
    getFileOperationsForRequest: vi.fn().mockImplementation(() => {
      return {
        getDirectoryContents: mockGetDirectoryContents
      };
    })
  };
});

describe('/api/files/directory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return directory contents successfully for root directory', async () => {
      const mockResult = {
        success: true,
        data: {
          currentPath: '',
          items: [
            {
              name: 'file1.md',
              path: 'file1.md',
              type: 'file',
              lastModified: '2023-01-01T00:00:00.000Z'
            },
            {
              name: 'folder1',
              path: 'folder1',
              type: 'directory',
              lastModified: '2023-01-01T00:00:00.000Z'
            }
          ],
          hasParent: false
        }
      };
      mockGetDirectoryContents.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files/directory?path=');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual(mockResult.data);
      expect(mockGetDirectoryContents).toHaveBeenCalledWith('');
    });

    it('should handle missing path parameter by defaulting to root', async () => {
      const mockResult = {
        success: true,
        data: {
          currentPath: '',
          items: [
            {
              name: 'file1.md',
              path: 'file1.md',
              type: 'file',
              lastModified: '2023-01-01T00:00:00.000Z'
            }
          ],
          hasParent: false
        }
      };
      mockGetDirectoryContents.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files/directory');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual(mockResult.data);
      expect(mockGetDirectoryContents).toHaveBeenCalledWith('');
    });

    it('should return 404 if directory not found', async () => {
      const mockResult = {
        success: false,
        error: 'Directory not found',
        statusCode: 404
      };
      mockGetDirectoryContents.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files/directory?path=nonexistent');
      const response = await GET(request);

      expect(response.status).toBe(404);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Directory not found');
      expect(mockGetDirectoryContents).toHaveBeenCalledWith('nonexistent');
    });

    it('should return 400 for invalid path', async () => {
      const mockResult = {
        success: false,
        error: 'Invalid path',
        statusCode: 400
      };
      mockGetDirectoryContents.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files/directory?path=../invalid');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Invalid path');
      expect(mockGetDirectoryContents).toHaveBeenCalledWith('../invalid');
    });

    it('should return 500 for internal server error', async () => {
      const mockResult = {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
      mockGetDirectoryContents.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files/directory?path=error-folder');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Internal server error');
      expect(mockGetDirectoryContents).toHaveBeenCalledWith('error-folder');
    });

    it('should handle file operations error during initialization', async () => {
      // Mock getFileOperationsForRequest to return a NextResponse error
      const { getFileOperationsForRequest } = await import('@/lib/api/shared/file-utils');
      const mockErrorResponse = new NextResponse(JSON.stringify({ error: 'Repository not found' }), { status: 404 });
      vi.mocked(getFileOperationsForRequest).mockReturnValueOnce(mockErrorResponse);

      const request = new NextRequest('http://localhost/api/files/directory?path=test');
      const response = await GET(request);

      expect(response.status).toBe(404);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Repository not found');
      expect(mockGetDirectoryContents).not.toHaveBeenCalled();
    });

    it('should handle unexpected exceptions gracefully', async () => {
      // Mock getFileOperationsForRequest to throw an error
      const { getFileOperationsForRequest } = await import('@/lib/api/shared/file-utils');
      vi.mocked(getFileOperationsForRequest).mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost/api/files/directory?path=test');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Internal server error');
      expect(mockGetDirectoryContents).not.toHaveBeenCalled();
    });

    it('should support repository parameter', async () => {
      const mockResult = {
        success: true,
        data: {
          currentPath: 'docs',
          items: [
            {
              name: 'readme.md',
              path: 'docs/readme.md',
              type: 'file',
              lastModified: '2023-01-01T00:00:00.000Z'
            }
          ],
          hasParent: true,
          parentPath: ''
        }
      };
      mockGetDirectoryContents.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files/directory?path=docs&repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual(mockResult.data);
      expect(mockGetDirectoryContents).toHaveBeenCalledWith('docs');
    });

    it('should handle URL decoding for paths with special characters', async () => {
      const mockResult = {
        success: true,
        data: {
          currentPath: 'folder with spaces',
          items: [
            {
              name: 'file with spaces.md',
              path: 'folder with spaces/file with spaces.md',
              type: 'file',
              lastModified: '2023-01-01T00:00:00.000Z'
            }
          ],
          hasParent: true,
          parentPath: ''
        }
      };
      mockGetDirectoryContents.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files/directory?path=folder%20with%20spaces');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual(mockResult.data);
      expect(mockGetDirectoryContents).toHaveBeenCalledWith('folder with spaces');
    });

    it('should handle empty path parameter correctly', async () => {
      const mockResult = {
        success: true,
        data: {
          currentPath: '',
          items: [
            {
              name: 'root-file.md',
              path: 'root-file.md',
              type: 'file',
              lastModified: '2023-01-01T00:00:00.000Z'
            }
          ],
          hasParent: false
        }
      };
      mockGetDirectoryContents.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files/directory?path=');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual(mockResult.data);
      expect(mockGetDirectoryContents).toHaveBeenCalledWith('');
    });
  });
});
