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
  CopyObjectCommand: vi.fn().mockImplementation((params) => ({ params })),
  DeleteObjectCommand: vi.fn().mockImplementation((params) => ({ params }))
}));

// Mock environment
vi.mock('@/lib/env', () => ({
  shouldUseMockApi: vi.fn()
}));

describe('/api/s3/operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.S3_BUCKET = 'test-bucket';
    process.env.S3_REGION = 'us-east-1';
    process.env.S3_ACCESS_KEY_ID = 'test-key';
    process.env.S3_SECRET_ACCESS_KEY = 'test-secret';
  });

  describe('POST - File Operations', () => {
    it('should move file successfully', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const requestBody = {
        operation: 'move',
        sourceKey: 'old/file.jpg',
        destinationKey: 'new/file.jpg'
      };
      const request = new NextRequest('http://localhost/api/s3/operations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'File moved'
      });
      expect(mockS3Send).toHaveBeenCalledTimes(2); // Copy + Delete
    });

    it('should rename file successfully', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockResolvedValue({});

      const requestBody = {
        operation: 'rename',
        sourceKey: 'file.jpg',
        destinationKey: 'renamed-file.jpg'
      };
      const request = new NextRequest('http://localhost/api/s3/operations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'File renamed'
      });
      expect(mockS3Send).toHaveBeenCalledTimes(2); // Copy + Delete
    });

    it('should use mock mode when enabled', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      const requestBody = {
        operation: 'move',
        sourceKey: 'old/file.jpg',
        destinationKey: 'new/file.jpg'
      };
      const request = new NextRequest('http://localhost/api/s3/operations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'File moved'
      });
      expect(mockS3Send).not.toHaveBeenCalled();
    });

    it('should return 400 when source key is missing', async () => {
      const requestBody = {
        operation: 'move',
        destinationKey: 'new/file.jpg'
      };
      const request = new NextRequest('http://localhost/api/s3/operations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Source key is required' });
    });

    it('should return 400 when destination key is missing for move', async () => {
      const requestBody = {
        operation: 'move',
        sourceKey: 'old/file.jpg'
      };
      const request = new NextRequest('http://localhost/api/s3/operations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Destination key is required' });
    });

    it('should return 400 when destination key is missing for rename', async () => {
      const requestBody = {
        operation: 'rename',
        sourceKey: 'file.jpg'
      };
      const request = new NextRequest('http://localhost/api/s3/operations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Destination key is required' });
    });

    it('should return 400 for invalid operation', async () => {
      const requestBody = {
        operation: 'invalid',
        sourceKey: 'file.jpg'
      };
      const request = new NextRequest('http://localhost/api/s3/operations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Invalid operation' });
    });

    it('should handle S3 operation errors', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      mockS3Send.mockRejectedValue(new Error('S3 operation failed'));

      const requestBody = {
        operation: 'move',
        sourceKey: 'old/file.jpg',
        destinationKey: 'new/file.jpg'
      };
      const request = new NextRequest('http://localhost/api/s3/operations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Failed to perform operation' });
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost/api/s3/operations', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({ error: 'Failed to perform operation' });
    });
  });
});