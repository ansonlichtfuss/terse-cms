import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { POST } from '../route';

// Create mock functions
const mockRenameFile = vi.fn();

// Mock the FileOperations class
vi.mock('@/lib/api/files/file-operations', () => {
  return {
    FileOperations: vi.fn().mockImplementation(() => ({
      renameFile: mockRenameFile,
    })),
  };
});

describe('/api/files/rename', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should rename a file successfully', async () => {
      const mockResult = { success: true };
      mockRenameFile.mockResolvedValue(mockResult);

      const requestBody = {
        sourcePath: 'old-name.md',
        newName: 'new-name.md',
        type: 'file',
      };
      const request = new NextRequest('http://localhost/api/files/rename', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'File renamed',
      });
      expect(mockRenameFile).toHaveBeenCalledWith('old-name.md', 'new-name.md');
    });

    it('should rename a directory successfully', async () => {
      const mockResult = { success: true };
      mockRenameFile.mockResolvedValue(mockResult);

      const requestBody = {
        sourcePath: 'old-folder',
        newName: 'new-folder',
        type: 'directory',
      };
      const request = new NextRequest('http://localhost/api/files/rename', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'Folder renamed',
      });
      expect(mockRenameFile).toHaveBeenCalledWith('old-folder', 'new-folder');
    });

    it('should handle rename without type specified (defaults to file)', async () => {
      const mockResult = { success: true };
      mockRenameFile.mockResolvedValue(mockResult);

      const requestBody = {
        sourcePath: 'old-name.md',
        newName: 'new-name.md',
      };
      const request = new NextRequest('http://localhost/api/files/rename', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'File renamed',
      });
      expect(mockRenameFile).toHaveBeenCalledWith('old-name.md', 'new-name.md');
    });

    it('should return 400 if sourcePath is missing', async () => {
      const requestBody = {
        newName: 'new-name.md',
      };
      const request = new NextRequest('http://localhost/api/files/rename', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Source path is required');
      expect(mockRenameFile).not.toHaveBeenCalled();
    });

    it('should return 400 if newName is missing', async () => {
      const requestBody = {
        sourcePath: 'old-name.md',
      };
      const request = new NextRequest('http://localhost/api/files/rename', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'New name is required');
      expect(mockRenameFile).not.toHaveBeenCalled();
    });

    it('should return 400 if sourcePath is empty', async () => {
      const requestBody = {
        sourcePath: '',
        newName: 'new-name.md',
      };
      const request = new NextRequest('http://localhost/api/files/rename', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Source path is required');
      expect(mockRenameFile).not.toHaveBeenCalled();
    });

    it('should return 400 if newName is empty', async () => {
      const requestBody = {
        sourcePath: 'old-name.md',
        newName: '',
      };
      const request = new NextRequest('http://localhost/api/files/rename', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'New name is required');
      expect(mockRenameFile).not.toHaveBeenCalled();
    });

    it('should handle file operation errors', async () => {
      const mockResult = {
        success: false,
        error: 'Rename failed',
        statusCode: 404,
      };
      mockRenameFile.mockResolvedValue(mockResult);

      const requestBody = {
        sourcePath: 'old-name.md',
        newName: 'new-name.md',
      };
      const request = new NextRequest('http://localhost/api/files/rename', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(404);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Rename failed');
      expect(mockRenameFile).toHaveBeenCalledWith('old-name.md', 'new-name.md');
    });

    it('should return 500 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost/api/files/rename', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Failed to rename file');
      expect(mockRenameFile).not.toHaveBeenCalled();
    });
  });
});