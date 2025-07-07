import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '../route';

// Mock AWS SDK
const mockS3Send = vi.fn();
const mockS3Client = {
  send: mockS3Send
};

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => mockS3Client),
  PutObjectCommand: vi.fn().mockImplementation((params) => ({ params }))
}));

// Mock environment
vi.mock('@/lib/env', () => ({
  shouldUseMockApi: vi.fn()
}));

describe('/api/s3/folder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.S3_BUCKET = 'test-bucket';
    process.env.S3_REGION = 'us-east-1';
    process.env.S3_ACCESS_KEY_ID = 'test-key';
    process.env.S3_SECRET_ACCESS_KEY = 'test-secret';
  });

  describe('POST - Create Folder', () => {
    it('should create folder in S3 successfully', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const requestBody = { path: 'documents/', name: 'new-folder' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'documents/new-folder/'
      });
      expect(mockS3Send).toHaveBeenCalledTimes(1);
    });

    it('should create folder in root path when no path provided', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const requestBody = { name: 'root-folder' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'root-folder/'
      });
    });

    it('should create folder with empty path', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const requestBody = { path: '', name: 'folder-in-root' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'folder-in-root/'
      });
    });

    it('should return 400 when folder name is missing', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      const requestBody = { path: 'documents/' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Folder name is required' });
      expect(mockS3Send).not.toHaveBeenCalled();
    });

    it('should return 400 when folder name is empty', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      const requestBody = { path: 'documents/', name: '' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Folder name is required' });
      expect(mockS3Send).not.toHaveBeenCalled();
    });

    it('should handle S3 create folder errors', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockRejectedValue(new Error('S3 create folder failed'));

      const requestBody = { path: 'documents/', name: 'new-folder' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Failed to create folder' });
    });

    it('should use mock mode when enabled', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const requestBody = { path: 'documents/', name: 'new-folder' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'documents/new-folder/'
      });
      expect(mockS3Send).not.toHaveBeenCalled();
    });

    it('should handle mock mode with root path', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const requestBody = { name: 'root-folder' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'root-folder/'
      });
    });

    it('should handle mock mode with missing folder name', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const requestBody = { path: 'documents/' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Folder name is required' });
    });

    it('should handle folder names with special characters', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const requestBody = { path: 'documents/', name: 'folder with spaces & symbols!' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'documents/folder with spaces & symbols!/'
      });
    });

    it('should handle nested folder paths', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const requestBody = { path: 'documents/projects/2023/', name: 'new-project' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'documents/projects/2023/new-project/'
      });
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Failed to create folder' });
    });

    it('should handle path with trailing slash already present', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const requestBody = { path: 'documents/', name: 'new-folder' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.key).toBe('documents/new-folder/');
    });

    it('should handle path without trailing slash', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const requestBody = { path: 'documents', name: 'new-folder' };
      const request = new NextRequest('http://localhost/api/s3/folder', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.key).toBe('documentsnew-folder/');
    });
  });
});
