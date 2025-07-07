/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/git', () => ({
  createGitInstance: vi.fn()
}));

vi.mock('@/lib/api', () => ({
  handleApiError: vi.fn(
    (error, context) =>
      new Response(JSON.stringify({ error: `${context}: ${error.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
  ),
  validateRequiredParam: vi.fn((param, name) => {
    if (!param || param.trim() === '') {
      return new Response(JSON.stringify({ error: `${name} is required` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return null;
  })
}));

import { createGitInstance } from '@/lib/git';

import { POST } from '../route';

describe('/api/git/commit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should commit changes with valid message', async () => {
      const mockCommitResult = {
        commit: 'abc123',
        summary: {
          changes: 2,
          insertions: 10,
          deletions: 5
        }
      };
      const mockGitAdd = vi.fn().mockResolvedValue(undefined);
      const mockGitCommit = vi.fn().mockResolvedValue(mockCommitResult);

      vi.mocked(createGitInstance).mockResolvedValue({
        add: mockGitAdd,
        commit: mockGitCommit
      } as any);

      const requestBody = { message: 'Add new feature' };
      const request = new NextRequest('http://localhost/api/git/commit?repo=test-repo', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        commit: mockCommitResult
      });
      expect(mockGitAdd).toHaveBeenCalledWith('.');
      expect(mockGitCommit).toHaveBeenCalledWith('Add new feature');
    });

    it('should return 400 for empty commit message', async () => {
      const requestBody = { message: '' };
      const request = new NextRequest('http://localhost/api/git/commit?repo=test-repo', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error');
    });

    it('should return 400 for missing commit message', async () => {
      const requestBody = {};
      const request = new NextRequest('http://localhost/api/git/commit?repo=test-repo', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error');
    });

    it('should handle git commit errors', async () => {
      const mockGitAdd = vi.fn().mockResolvedValue(undefined);
      const mockGitCommit = vi.fn().mockRejectedValue(new Error('Nothing to commit'));

      vi.mocked(createGitInstance).mockResolvedValue({
        add: mockGitAdd,
        commit: mockGitCommit
      } as any);

      const requestBody = { message: 'Test commit' };
      const request = new NextRequest('http://localhost/api/git/commit?repo=test-repo', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error');
    });

    it('should handle git add errors', async () => {
      const mockGitAdd = vi.fn().mockRejectedValue(new Error('Failed to add files'));
      const mockGitCommit = vi.fn();

      vi.mocked(createGitInstance).mockResolvedValue({
        add: mockGitAdd,
        commit: mockGitCommit
      } as any);

      const requestBody = { message: 'Test commit' };
      const request = new NextRequest('http://localhost/api/git/commit?repo=test-repo', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error');
      expect(mockGitCommit).not.toHaveBeenCalled();
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost/api/git/commit?repo=test-repo', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error');
    });
  });
});
