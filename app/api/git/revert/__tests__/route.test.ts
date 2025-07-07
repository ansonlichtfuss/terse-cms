/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the git library
vi.mock('@/lib/git', () => ({
  createGitInstance: vi.fn()
}));

import { createGitInstance } from '@/lib/git';

import { POST } from '../route';

describe('/api/git/revert', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should revert changes successfully', async () => {
      const mockGitReset = vi.fn().mockResolvedValue(undefined);
      const mockGitClean = vi.fn().mockResolvedValue(undefined);

      vi.mocked(createGitInstance).mockResolvedValue({
        reset: mockGitReset,
        clean: mockGitClean
      } as any);

      const request = new NextRequest('http://localhost/api/git/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'Changes reverted'
      });
      expect(mockGitReset).toHaveBeenCalledWith('hard');
      expect(mockGitClean).toHaveBeenCalledWith('f', ['-d']);
    });

    it('should handle git reset errors', async () => {
      const mockGitReset = vi.fn().mockRejectedValue(new Error('Git reset failed'));
      const mockGitClean = vi.fn();

      vi.mocked(createGitInstance).mockResolvedValue({
        reset: mockGitReset,
        clean: mockGitClean
      } as any);

      const request = new NextRequest('http://localhost/api/git/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to revert changes'
      });
      expect(mockGitReset).toHaveBeenCalledWith('hard');
      expect(mockGitClean).not.toHaveBeenCalled();
    });

    it('should handle git clean errors', async () => {
      const mockGitReset = vi.fn().mockResolvedValue(undefined);
      const mockGitClean = vi.fn().mockRejectedValue(new Error('Git clean failed'));

      vi.mocked(createGitInstance).mockResolvedValue({
        reset: mockGitReset,
        clean: mockGitClean
      } as any);

      const request = new NextRequest('http://localhost/api/git/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to revert changes'
      });
      expect(mockGitReset).toHaveBeenCalledWith('hard');
      expect(mockGitClean).toHaveBeenCalledWith('f', ['-d']);
    });

    it('should handle git instance creation failure', async () => {
      vi.mocked(createGitInstance).mockRejectedValue(new Error('Git instance creation failed'));

      const request = new NextRequest('http://localhost/api/git/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to revert changes'
      });
    });

    it('should revert changes without request body', async () => {
      const mockGitReset = vi.fn().mockResolvedValue(undefined);
      const mockGitClean = vi.fn().mockResolvedValue(undefined);

      vi.mocked(createGitInstance).mockResolvedValue({
        reset: mockGitReset,
        clean: mockGitClean
      } as any);

      const request = new NextRequest('http://localhost/api/git/revert', {
        method: 'POST'
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'Changes reverted'
      });
      expect(mockGitReset).toHaveBeenCalledWith('hard');
      expect(mockGitClean).toHaveBeenCalledWith('f', ['-d']);
    });

    it('should handle repository not found error', async () => {
      const mockGitReset = vi.fn().mockRejectedValue(new Error('fatal: not a git repository'));

      vi.mocked(createGitInstance).mockResolvedValue({
        reset: mockGitReset,
        clean: vi.fn()
      } as any);

      const request = new NextRequest('http://localhost/api/git/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to revert changes'
      });
    });

    it('should handle permission denied error', async () => {
      const mockGitReset = vi.fn().mockRejectedValue(new Error('Permission denied'));

      vi.mocked(createGitInstance).mockResolvedValue({
        reset: mockGitReset,
        clean: vi.fn()
      } as any);

      const request = new NextRequest('http://localhost/api/git/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to revert changes'
      });
    });
  });
});
