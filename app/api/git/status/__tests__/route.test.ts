/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the git library
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
  )
}));

import { createGitInstance } from '@/lib/git';

import { GET } from '../route';

describe('/api/git/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return clean status with no modified files', async () => {
      const mockStatus = {
        modified: [],
        not_added: [],
        created: [],
        deleted: [],
        renamed: [],
        isClean: () => true
      };
      const mockGitStatus = vi.fn().mockResolvedValue(mockStatus);

      vi.mocked(createGitInstance).mockResolvedValue({
        status: mockGitStatus
      } as any);

      const request = new NextRequest('http://localhost/api/git/status?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        modifiedFiles: [],
        isClean: true
      });
    });

    it('should return modified files when repository is dirty', async () => {
      const mockStatus = {
        modified: ['file1.md', 'file2.md'],
        not_added: ['new-file.md'],
        created: ['created-file.md'],
        deleted: ['deleted-file.md'],
        renamed: [{ from: 'old.md', to: 'new.md' }],
        isClean: () => false
      };
      const mockGitStatus = vi.fn().mockResolvedValue(mockStatus);

      vi.mocked(createGitInstance).mockResolvedValue({
        status: mockGitStatus
      } as any);

      const request = new NextRequest('http://localhost/api/git/status?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        modifiedFiles: ['file1.md', 'file2.md', 'new-file.md', 'created-file.md', 'deleted-file.md', 'new.md'],
        isClean: false
      });
    });

    it('should handle git errors gracefully', async () => {
      const mockGitStatus = vi.fn().mockRejectedValue(new Error('Git repository not found'));

      vi.mocked(createGitInstance).mockResolvedValue({
        status: mockGitStatus
      } as any);

      const request = new NextRequest('http://localhost/api/git/status?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toHaveProperty('error');
    });

    it('should handle empty status object', async () => {
      const mockStatus = {
        modified: [],
        not_added: [],
        created: [],
        deleted: [],
        renamed: [],
        isClean: () => true
      };
      const mockGitStatus = vi.fn().mockResolvedValue(mockStatus);

      vi.mocked(createGitInstance).mockResolvedValue({
        status: mockGitStatus
      } as any);

      const request = new NextRequest('http://localhost/api/git/status?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse.modifiedFiles).toEqual([]);
      expect(jsonResponse.isClean).toBe(true);
    });
  });
});
