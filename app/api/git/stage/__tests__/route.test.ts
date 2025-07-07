/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/git', () => ({
  createGitInstance: vi.fn()
}));

import { createGitInstance } from '@/lib/git';

import { POST } from '../route';

describe('/api/git/stage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should stage all changes successfully', async () => {
      const mockGitAdd = vi.fn().mockResolvedValue(undefined);

      vi.mocked(createGitInstance).mockResolvedValue({
        add: mockGitAdd
      } as any);

      const request = new NextRequest('http://localhost/api/git/stage?repo=test-repo', {
        method: 'POST'
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true
      });
      expect(mockGitAdd).toHaveBeenCalledWith('.');
    });

    it('should handle git add errors gracefully', async () => {
      const mockGitAdd = vi.fn().mockRejectedValue(new Error('Failed to add files'));

      vi.mocked(createGitInstance).mockResolvedValue({
        add: mockGitAdd
      } as any);

      const request = new NextRequest('http://localhost/api/git/stage?repo=test-repo', {
        method: 'POST'
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to stage changes'
      });
    });

    it('should handle repository not found errors', async () => {
      const mockGitAdd = vi.fn().mockRejectedValue(new Error('Git repository not found'));

      vi.mocked(createGitInstance).mockResolvedValue({
        add: mockGitAdd
      } as any);

      const request = new NextRequest('http://localhost/api/git/stage?repo=test-repo', {
        method: 'POST'
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to stage changes'
      });
    });

    it('should handle permission errors', async () => {
      const mockGitAdd = vi.fn().mockRejectedValue(new Error('Permission denied'));

      vi.mocked(createGitInstance).mockResolvedValue({
        add: mockGitAdd
      } as any);

      const request = new NextRequest('http://localhost/api/git/stage?repo=test-repo', {
        method: 'POST'
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to stage changes'
      });
    });

    it('should handle empty repository scenarios', async () => {
      const mockGitAdd = vi.fn().mockResolvedValue(undefined);

      vi.mocked(createGitInstance).mockResolvedValue({
        add: mockGitAdd
      } as any);

      const request = new NextRequest('http://localhost/api/git/stage?repo=empty-repo', {
        method: 'POST'
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true
      });
      expect(mockGitAdd).toHaveBeenCalledWith('.');
    });

    it('should handle createGitInstance errors', async () => {
      vi.mocked(createGitInstance).mockRejectedValue(new Error('Repository not configured'));

      const request = new NextRequest('http://localhost/api/git/stage?repo=invalid-repo', {
        method: 'POST'
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to stage changes'
      });
    });
  });
});

