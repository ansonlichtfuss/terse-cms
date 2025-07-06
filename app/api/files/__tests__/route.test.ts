import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE, GET, POST } from '../route';

// Create mock functions
const mockReadFile = vi.fn();
const mockWriteFile = vi.fn();
const mockDeleteFile = vi.fn();

// Mock the FileOperations class
vi.mock('@/lib/api/files/file-operations', () => {
  return {
    FileOperations: vi.fn().mockImplementation(() => ({
      readFile: mockReadFile,
      writeFile: mockWriteFile,
      deleteFile: mockDeleteFile
    }))
  };
});

describe('/api/files', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return file content successfully', async () => {
      const mockResult = {
        success: true,
        data: { path: 'test.md', content: '# Test Content' }
      };
      mockReadFile.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files?path=test.md');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual(mockResult.data);
      expect(mockReadFile).toHaveBeenCalledWith('test.md');
    });

    it('should return 400 if path parameter is missing', async () => {
      const request = new NextRequest('http://localhost/api/files');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Path parameter is required');
      expect(mockReadFile).not.toHaveBeenCalled();
    });

    it('should return 404 if file not found', async () => {
      const mockResult = {
        success: false,
        error: 'File not found',
        statusCode: 404
      };
      mockReadFile.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost/api/files?path=nonexistent.md');
      const response = await GET(request);

      expect(response.status).toBe(404);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'File not found');
      expect(mockReadFile).toHaveBeenCalledWith('nonexistent.md');
    });

    it('should return 400 for empty path parameter', async () => {
      const request = new NextRequest('http://localhost/api/files?path=');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Path parameter is required');
      expect(mockReadFile).not.toHaveBeenCalled();
    });
  });

  describe('POST', () => {
    it('should create/update file successfully', async () => {
      const mockResult = { success: true };
      mockWriteFile.mockResolvedValue(mockResult);

      const requestBody = { path: 'test.md', content: '# Test Content' };
      const request = new NextRequest('http://localhost/api/files', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('success', true);
      expect(mockWriteFile).toHaveBeenCalledWith('test.md', '# Test Content');
    });

    it('should return 400 if path is missing', async () => {
      const requestBody = { content: '# Test Content' };
      const request = new NextRequest('http://localhost/api/files', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Path parameter is required');
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('should handle file operation errors', async () => {
      const mockResult = {
        success: false,
        error: 'Write failed',
        statusCode: 500
      };
      mockWriteFile.mockResolvedValue(mockResult);

      const requestBody = { path: 'test.md', content: '# Test Content' };
      const request = new NextRequest('http://localhost/api/files', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Write failed');
      expect(mockWriteFile).toHaveBeenCalledWith('test.md', '# Test Content');
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost/api/files', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Invalid request body');
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('should handle empty content', async () => {
      const mockResult = { success: true };
      mockWriteFile.mockResolvedValue(mockResult);

      const requestBody = { path: 'empty.md', content: '' };
      const request = new NextRequest('http://localhost/api/files', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('success', true);
      expect(mockWriteFile).toHaveBeenCalledWith('empty.md', '');
    });

    it('should handle undefined content', async () => {
      const mockResult = { success: true };
      mockWriteFile.mockResolvedValue(mockResult);

      const requestBody = { path: 'undefined-content.md' };
      const request = new NextRequest('http://localhost/api/files', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('success', true);
      expect(mockWriteFile).toHaveBeenCalledWith('undefined-content.md', undefined);
    });
  });

  describe('DELETE', () => {
    it('should delete file successfully', async () => {
      const mockResult = { success: true };
      mockDeleteFile.mockResolvedValue(mockResult);

      const requestBody = { path: 'test.md' };
      const request = new NextRequest('http://localhost/api/files', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('success', true);
      expect(mockDeleteFile).toHaveBeenCalledWith('test.md');
    });

    it('should return 400 if path is missing', async () => {
      const requestBody = {};
      const request = new NextRequest('http://localhost/api/files', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Path parameter is required');
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });

    it('should handle file operation errors', async () => {
      const mockResult = {
        success: false,
        error: 'Delete failed',
        statusCode: 500
      };
      mockDeleteFile.mockResolvedValue(mockResult);

      const requestBody = { path: 'test.md' };
      const request = new NextRequest('http://localhost/api/files', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Delete failed');
      expect(mockDeleteFile).toHaveBeenCalledWith('test.md');
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost/api/files', {
        method: 'DELETE',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Invalid request body');
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });

    it('should return 400 for empty path', async () => {
      const requestBody = { path: '' };
      const request = new NextRequest('http://localhost/api/files', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Path parameter is required');
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });
  });
});
