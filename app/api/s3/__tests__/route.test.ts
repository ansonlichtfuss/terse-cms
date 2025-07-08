import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE, GET } from '../route';

// Mock AWS SDK
const mockS3Send = vi.fn();
const mockS3Client = {
  send: mockS3Send
};

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => mockS3Client),
  ListObjectsV2Command: vi.fn().mockImplementation((params) => ({ params })),
  DeleteObjectCommand: vi.fn().mockImplementation((params) => ({ params })),
  DeleteObjectsCommand: vi.fn().mockImplementation((params) => ({ params }))
}));

// Mock environment
vi.mock('@/lib/env', () => ({
  shouldUseMockApi: vi.fn()
}));

// Mock filesystem for mock mode
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn()
}));

// Mock path module
vi.mock('path', () => ({
  dirname: vi.fn()
}));

describe('/api/s3', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.S3_BUCKET = 'test-bucket';
    process.env.S3_REGION = 'us-east-1';
    process.env.S3_ACCESS_KEY_ID = 'test-key';
    process.env.S3_SECRET_ACCESS_KEY = 'test-secret';
  });

  describe('GET - List Objects', () => {
    it('should list S3 objects for root path', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      const mockResponse = {
        Contents: [
          {
            Key: 'file1.jpg',
            Size: 1024,
            LastModified: new Date('2023-01-01')
          },
          {
            Key: 'file2.png',
            Size: 2048,
            LastModified: new Date('2023-01-02')
          }
        ],
        CommonPrefixes: [{ Prefix: 'folder1/' }]
      };
      mockS3Send.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost/api/s3');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.items).toHaveLength(3); // 2 files + 1 folder
      expect(jsonResponse.items[0]).toEqual({
        key: 'folder1/',
        type: 'folder'
      });
      expect(jsonResponse.items[1]).toEqual({
        key: 'file1.jpg',
        type: 'file',
        size: 1024,
        lastModified: '2023-01-01T00:00:00.000Z',
        url: 'https://test-bucket.s3.us-east-1.amazonaws.com/file1.jpg'
      });
    });

    it('should list S3 objects for specific path', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      const mockResponse = {
        Contents: [
          {
            Key: 'docs/file1.md',
            Size: 512,
            LastModified: new Date('2023-01-03')
          }
        ],
        CommonPrefixes: []
      };
      mockS3Send.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost/api/s3?path=docs/');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.items).toHaveLength(1);
      expect(jsonResponse.items[0]).toEqual({
        key: 'docs/file1.md',
        type: 'file',
        size: 512,
        lastModified: '2023-01-03T00:00:00.000Z',
        url: 'https://test-bucket.s3.us-east-1.amazonaws.com/docs/file1.md'
      });
    });

    it('should handle custom S3 endpoint', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      process.env.S3_REGION = 'http://localhost:9000';

      const mockResponse = {
        Contents: [
          {
            Key: 'file1.jpg',
            Size: 1024,
            LastModified: new Date('2023-01-01')
          }
        ],
        CommonPrefixes: []
      };
      mockS3Send.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost/api/s3');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.items[0].url).toBe('http://localhost:9000/test-bucket/file1.jpg');
    });

    it('should use mock data when mock API is enabled', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const fs = await import('fs');
      const mockS3Data = {
        '': [{ key: 'mock-file.jpg', type: 'file', size: 1024 }]
      };
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockS3Data));

      const request = new NextRequest('http://localhost/api/s3');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.items).toEqual([{ key: 'mock-file.jpg', type: 'file', size: 1024 }]);
      expect(fs.readFileSync).toHaveBeenCalledWith('mock-data/s3-items.json', 'utf8');
    });

    it('should handle empty S3 response', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      const mockResponse = {
        Contents: [],
        CommonPrefixes: []
      };
      mockS3Send.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost/api/s3');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.items).toEqual([]);
    });

    it('should handle S3 errors gracefully', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockRejectedValue(new Error('S3 access denied'));

      const request = new NextRequest('http://localhost/api/s3');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Failed to list S3 objects');
    });

    it('should handle mock file read errors', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const fs = await import('fs');
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File not found');
      });

      const request = new NextRequest('http://localhost/api/s3');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Failed to read mock S3 data');
    });
  });

  describe('DELETE - Delete Objects', () => {
    it('should delete single file', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const requestBody = { key: 'file1.jpg', type: 'file' };
      const request = new NextRequest('http://localhost/api/s3', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ success: true });
      expect(mockS3Send).toHaveBeenCalledTimes(1);
    });

    it('should delete folder and all contents', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      // Mock list response for folder contents
      const mockListResponse = {
        Contents: [{ Key: 'folder1/file1.jpg' }, { Key: 'folder1/file2.png' }]
      };

      mockS3Send
        .mockResolvedValueOnce(mockListResponse) // List objects
        .mockResolvedValueOnce({}); // Delete objects

      const requestBody = { key: 'folder1/', type: 'folder' };
      const request = new NextRequest('http://localhost/api/s3', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ success: true });
      expect(mockS3Send).toHaveBeenCalledTimes(2);
    });

    it('should handle empty folder deletion', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      const mockListResponse = {
        Contents: []
      };

      mockS3Send.mockResolvedValueOnce(mockListResponse);

      const requestBody = { key: 'empty-folder/', type: 'folder' };
      const request = new NextRequest('http://localhost/api/s3', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ success: true });
      expect(mockS3Send).toHaveBeenCalledTimes(1); // Only list, no delete
    });

    it('should use mock data when mock API is enabled', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const fs = await import('fs');
      const pathModule = await import('path');
      const mockS3Data = {
        '': [{ key: 'mock-file.jpg', type: 'file', size: 1024 }]
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockS3Data));
      vi.mocked(pathModule.dirname).mockReturnValue('');
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const requestBody = { key: 'mock-file.jpg', type: 'file' };
      const request = new NextRequest('http://localhost/api/s3', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ success: true });
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle mock folder deletion', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const fs = await import('fs');
      const mockS3Data = {
        'folder1/': [{ key: 'folder1/file1.jpg', type: 'file', size: 1024 }],
        '': [{ key: 'folder1/', type: 'folder' }]
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockS3Data));
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const requestBody = { key: 'folder1/', type: 'folder' };
      const request = new NextRequest('http://localhost/api/s3', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ success: true });
    });

    it('should handle S3 delete errors', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockRejectedValue(new Error('S3 delete failed'));

      const requestBody = { key: 'file1.jpg', type: 'file' };
      const request = new NextRequest('http://localhost/api/s3', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Failed to delete S3 object');
    });

    it('should handle mock file operation errors', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const fs = await import('fs');
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File read failed');
      });

      const requestBody = { key: 'file1.jpg', type: 'file' };
      const request = new NextRequest('http://localhost/api/s3', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Failed to delete mock S3 object');
    });

    it('should handle invalid JSON in request body', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      const request = new NextRequest('http://localhost/api/s3', {
        method: 'DELETE',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await DELETE(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error', 'Failed to delete S3 object');
    });

    it('should handle folder URL generation with S3_FOLDER_URL_BASE', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      process.env.S3_FOLDER_URL_BASE = 'https://custom-cdn.com/';

      const mockResponse = {
        Contents: [
          {
            Key: 'folder/',
            Size: 0,
            LastModified: new Date('2023-01-01')
          }
        ],
        CommonPrefixes: []
      };
      mockS3Send.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost/api/s3');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.items[0].url).toBe('https://custom-cdn.com/folder/');
    });

    it('should handle file URL generation with S3_FILE_URL_BASE', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      process.env.S3_FILE_URL_BASE = 'https://custom-cdn.com/';

      const mockResponse = {
        Contents: [
          {
            Key: 'file.jpg',
            Size: 1024,
            LastModified: new Date('2023-01-01')
          }
        ],
        CommonPrefixes: []
      };
      mockS3Send.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost/api/s3');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.items[0].url).toBe('https://custom-cdn.com/file.jpg');
    });

    it('should handle undefined item keys in S3 response', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      const mockResponse = {
        Contents: [
          {
            Key: undefined,
            Size: 1024,
            LastModified: new Date('2023-01-01')
          }
        ],
        CommonPrefixes: []
      };
      mockS3Send.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost/api/s3');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.items[0]).toEqual({
        key: '',
        type: 'file',
        size: 1024,
        lastModified: '2023-01-01T00:00:00.000Z',
        url: ''
      });
    });
  });
});
