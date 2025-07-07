/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/git', () => ({
  createGitInstance: vi.fn()
}));

import { createGitInstance } from '@/lib/git';

import { GET } from '../route';

describe('/api/git/branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return branch list with current branch marked', async () => {
      const mockBranchSummary = {
        all: ['main', 'feature-branch', 'bugfix-branch'],
        current: 'main'
      };
      const mockGitBranchLocal = vi.fn().mockResolvedValue(mockBranchSummary);

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branches?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        branches: [
          { name: 'main', isCurrent: true },
          { name: 'feature-branch', isCurrent: false },
          { name: 'bugfix-branch', isCurrent: false }
        ]
      });
    });

    it('should return single branch when only main exists', async () => {
      const mockBranchSummary = {
        all: ['main'],
        current: 'main'
      };
      const mockGitBranchLocal = vi.fn().mockResolvedValue(mockBranchSummary);

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branches?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        branches: [{ name: 'main', isCurrent: true }]
      });
    });

    it('should handle empty branch list', async () => {
      const mockBranchSummary = {
        all: [],
        current: null
      };
      const mockGitBranchLocal = vi.fn().mockResolvedValue(mockBranchSummary);

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branches?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        branches: []
      });
    });

    it('should handle git errors gracefully', async () => {
      const mockGitBranchLocal = vi.fn().mockRejectedValue(new Error('Git repository not found'));

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branches?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to get git branches'
      });
    });

    it('should handle different current branch scenarios', async () => {
      const mockBranchSummary = {
        all: ['main', 'development', 'feature-new'],
        current: 'development'
      };
      const mockGitBranchLocal = vi.fn().mockResolvedValue(mockBranchSummary);

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branches?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        branches: [
          { name: 'main', isCurrent: false },
          { name: 'development', isCurrent: true },
          { name: 'feature-new', isCurrent: false }
        ]
      });
    });

    it('should handle branch names with special characters', async () => {
      const mockBranchSummary = {
        all: ['main', 'feature/user-auth', 'bugfix/fix-login-bug'],
        current: 'feature/user-auth'
      };
      const mockGitBranchLocal = vi.fn().mockResolvedValue(mockBranchSummary);

      vi.mocked(createGitInstance).mockResolvedValue({
        branchLocal: mockGitBranchLocal
      } as any);

      const request = new NextRequest('http://localhost/api/git/branches?repo=test-repo');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        branches: [
          { name: 'main', isCurrent: false },
          { name: 'feature/user-auth', isCurrent: true },
          { name: 'bugfix/fix-login-bug', isCurrent: false }
        ]
      });
    });
  });
});

