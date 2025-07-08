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

describe('/api/s3/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.S3_BUCKET = 'test-bucket';
    process.env.S3_REGION = 'us-east-1';
    process.env.S3_ACCESS_KEY_ID = 'test-key';
    process.env.S3_SECRET_ACCESS_KEY = 'test-secret';
  });

  describe('POST - Upload File', () => {
    it('should upload file to S3 successfully', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('path', 'images/');

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'images/test.jpg',
        url: 'https://test-bucket.s3.us-east-1.amazonaws.com/images/test.jpg'
      });
      expect(mockS3Send).toHaveBeenCalledTimes(1);
    });

    it('should upload file to root path when no path provided', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'test.jpg',
        url: 'https://test-bucket.s3.us-east-1.amazonaws.com/test.jpg'
      });
    });

    it('should handle different file types', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const mockFile = new File(['test content'], 'document.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('path', 'docs/');

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'docs/document.pdf',
        url: 'https://test-bucket.s3.us-east-1.amazonaws.com/docs/document.pdf'
      });
    });

    it('should return 400 when no file is provided', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      const formData = new FormData();
      formData.append('path', 'images/');

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'No file provided' });
      expect(mockS3Send).not.toHaveBeenCalled();
    });

    it('should handle S3 upload errors', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockRejectedValue(new Error('S3 upload failed'));

      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Failed to upload file' });
    });

    it('should use mock mode when enabled', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('path', 'images/');

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'images/test.jpg',
        url: 'https://placehold.co/600x400/EEE/31343C?text=test.jpg'
      });
      expect(mockS3Send).not.toHaveBeenCalled();
    });

    it('should handle mock mode with no file error', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const formData = new FormData();
      formData.append('path', 'images/');

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'No file provided' });
    });

    it('should handle mock mode with root path', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'test.jpg',
        url: 'https://placehold.co/600x400/EEE/31343C?text=test.jpg'
      });
    });

    it('should handle special characters in filename', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const mockFile = new File(['test content'], 'test file with spaces.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.key).toBe('test file with spaces.jpg');
      expect(jsonResponse.url).toBe('https://placehold.co/600x400/EEE/31343C?text=test%20file%20with%20spaces.jpg');
    });

    it('should handle empty file', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const mockFile = new File([''], 'empty.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.key).toBe('empty.txt');
    });

    it('should handle large file uploads', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const largeContent = 'x'.repeat(1024 * 1024); // 1MB
      const mockFile = new File([largeContent], 'large.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.key).toBe('large.txt');
    });

    it('should handle custom S3 endpoint with region URL', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      process.env.S3_REGION = 'http://localhost:9000';
      mockS3Send.mockResolvedValue({});

      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        key: 'test.jpg',
        url: 'https://test-bucket.s3.http://localhost:9000.amazonaws.com/test.jpg'
      });
    });

    it('should handle formData parsing errors', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      const request = new NextRequest('http://localhost/api/s3/upload', {
        method: 'POST',
        body: 'invalid form data'
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Failed to upload file' });
    });
  });
});
