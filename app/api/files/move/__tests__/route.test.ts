import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { POST } from '../route';

// Create mock functions
const mockMoveFile = vi.fn();

// Mock the FileOperations class
vi.mock('@/lib/api/files/file-operations', () => {
  return {
    FileOperations: vi.fn().mockImplementation(() => ({
      moveFile: mockMoveFile,
    })),
  };
});

describe('/api/files/move', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should move a file successfully', async () => {
      const mockResult = { success: true };
      mockMoveFile.mockResolvedValue(mockResult);

      const requestBody = {
        sourcePath: 'source.md',
        destinationPath: 'destination.md',
        type: 'file',
      };
      const request = new NextRequest('http://localhost/api/files/move', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'File moved',
      });
      expect(mockMoveFile).toHaveBeenCalledWith('source.md', 'destination.md');
    });

    it('should move a directory successfully', async () => {
      const mockResult = { success: true };
      mockMoveFile.mockResolvedValue(mockResult);

      const requestBody = {
        sourcePath: 'source-folder',
        destinationPath: 'destination-folder',
        type: 'directory',
      };
      const request = new NextRequest('http://localhost/api/files/move', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'Folder moved',
      });
      expect(mockMoveFile).toHaveBeenCalledWith('source-folder', 'destination-folder');
    });

    it('should handle move without type specified (defaults to file)', async () => {
      const mockResult = { success: true };
      mockMoveFile.mockResolvedValue(mockResult);

      const requestBody = {
        sourcePath: 'source.md',
        destinationPath: 'destination.md',
      };
      const request = new NextRequest('http://localhost/api/files/move', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'File moved',
      });
      expect(mockMoveFile).toHaveBeenCalledWith('source.md', 'destination.md');
    });

    it('should return 400 if sourcePath is missing', async () => {
      const requestBody = {
        destinationPath: 'destination.md',
      };
      const request = new NextRequest('http://localhost/api/files/move', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Source path is required');
      expect(mockMoveFile).not.toHaveBeenCalled();
    });

    it('should return 400 if destinationPath is missing', async () => {
      const requestBody = {
        sourcePath: 'source.md',
      };
      const request = new NextRequest('http://localhost/api/files/move', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Destination path is required');
      expect(mockMoveFile).not.toHaveBeenCalled();
    });

    it('should return 400 if sourcePath is empty', async () => {
      const requestBody = {
        sourcePath: '',
        destinationPath: 'destination.md',
      };
      const request = new NextRequest('http://localhost/api/files/move', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Source path is required');
      expect(mockMoveFile).not.toHaveBeenCalled();
    });

    it('should return 400 if destinationPath is empty', async () => {
      const requestBody = {
        sourcePath: 'source.md',
        destinationPath: '',
      };
      const request = new NextRequest('http://localhost/api/files/move', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Destination path is required');
      expect(mockMoveFile).not.toHaveBeenCalled();
    });

    it('should handle file operation errors', async () => {
      const mockResult = {
        success: false,
        error: 'Move failed',
        statusCode: 404,
      };
      mockMoveFile.mockResolvedValue(mockResult);

      const requestBody = {
        sourcePath: 'source.md',
        destinationPath: 'destination.md',
      };
      const request = new NextRequest('http://localhost/api/files/move', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(404);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Move failed');
      expect(mockMoveFile).toHaveBeenCalledWith('source.md', 'destination.md');
    });

    it('should return 500 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost/api/files/move', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Failed to move file');
      expect(mockMoveFile).not.toHaveBeenCalled();
    });
  });
});