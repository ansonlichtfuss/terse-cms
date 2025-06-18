import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '../route';

// Create mock functions
const mockGetFileTree = vi.fn();

// Mock the FileOperations class
vi.mock('@/lib/api/files/file-operations', () => {
  return {
    FileOperations: vi.fn().mockImplementation(() => ({
      getFileTree: mockGetFileTree
    }))
  };
});

describe('/api/files/tree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return file tree successfully', async () => {
      const mockResult = {
        success: true,
        data: {
          files: [
            { name: 'file1.md', type: 'file', path: 'file1.md', lastModified: '2023-01-01T10:30:00.000Z' },
            {
              name: 'folder1',
              type: 'directory',
              path: 'folder1',
              children: [],
              lastModified: '2023-01-01T10:30:00.000Z'
            }
          ]
        }
      };
      mockGetFileTree.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files/tree');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual(mockResult.data);
      expect(mockGetFileTree).toHaveBeenCalled();
    });

    it('should handle file tree operation errors', async () => {
      const mockResult = {
        success: false,
        error: 'Failed to read directory',
        statusCode: 500
      };
      mockGetFileTree.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files/tree');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Failed to read directory');
      expect(mockGetFileTree).toHaveBeenCalled();
    });

    it('should handle file tree with empty results', async () => {
      const mockResult = {
        success: true,
        data: {
          files: []
        }
      };
      mockGetFileTree.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files/tree');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ files: [] });
      expect(mockGetFileTree).toHaveBeenCalled();
    });

    it('should ignore query parameters and always return full tree', async () => {
      const mockResult = {
        success: true,
        data: {
          files: [{ name: 'file1.md', type: 'file', path: 'file1.md', lastModified: '2023-01-01T10:30:00.000Z' }]
        }
      };
      mockGetFileTree.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files/tree?path=some-path&other=param');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual(mockResult.data);
      expect(mockGetFileTree).toHaveBeenCalled();
    });
  });
});
