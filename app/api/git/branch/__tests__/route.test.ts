/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/git', () => ({
  createGitInstance: vi.fn()
}));

import { createGitInstance } from '@/lib/git';

import { GET } from '../route';

describe('/api/git/branch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return current branch name', async () => {
      const mockBranchSummary = {
        current: 'main'
      };
      const mockGitBranchLocal = vi.fn().mockResolvedValue(mockBranchSummary);

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branch?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        branch: 'main'
      });
      expect(mockGitBranchLocal).toHaveBeenCalledTimes(1);
    });

    it('should return different branch names', async () => {
      const mockBranchSummary = {
        current: 'feature/user-authentication'
      };
      const mockGitBranchLocal = vi.fn().mockResolvedValue(mockBranchSummary);

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branch?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        branch: 'feature/user-authentication'
      });
    });

    it('should handle branch names with special characters', async () => {
      const mockBranchSummary = {
        current: 'bugfix/fix-login-bug_v2'
      };
      const mockGitBranchLocal = vi.fn().mockResolvedValue(mockBranchSummary);

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branch?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        branch: 'bugfix/fix-login-bug_v2'
      });
    });

    it('should handle git repository not found error', async () => {
      const mockGitBranchLocal = vi.fn().mockRejectedValue(new Error('Git repository not found'));

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branch?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to get git branch'
      });
    });

    it('should handle createGitInstance errors', async () => {
      vi.mocked(createGitInstance).mockRejectedValue(new Error('Failed to create git instance'));

      const request = new NextRequest('http://localhost/api/git/branch?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to get git branch'
      });
    });

    it('should handle general git errors', async () => {
      const mockGitBranchLocal = vi.fn().mockRejectedValue(new Error('Permission denied'));

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branch?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to get git branch'
      });
    });

    it('should handle null current branch', async () => {
      const mockBranchSummary = {
        current: null
      };
      const mockGitBranchLocal = vi.fn().mockResolvedValue(mockBranchSummary);

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branch?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        branch: null
      });
    });

    it('should handle undefined current branch', async () => {
      const mockBranchSummary = {
        current: undefined
      };
      const mockGitBranchLocal = vi.fn().mockResolvedValue(mockBranchSummary);

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branch?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        branch: undefined
      });
    });
  });
});
