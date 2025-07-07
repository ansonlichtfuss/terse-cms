/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the git library
vi.mock('@/lib/git', () => ({
  createGitInstance: vi.fn()
}));

import { createGitInstance } from '@/lib/git';

import { POST } from '../route';

describe('/api/git/switch-branch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should switch branch successfully when no pending changes', async () => {
      const mockStatus = {
        files: []
      };
      const mockGitStatus = vi.fn().mockResolvedValue(mockStatus);
      const mockGitCheckout = vi.fn().mockResolvedValue(undefined);

      vi.mocked(createGitInstance).mockResolvedValue({
        status: mockGitStatus,
        checkout: mockGitCheckout
      } as any);

      const requestBody = { branchName: 'feature-branch' };
      const request = new NextRequest('http://localhost/api/git/switch-branch', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'Switched to branch feature-branch'
      });
      expect(mockGitStatus).toHaveBeenCalledOnce();
      expect(mockGitCheckout).toHaveBeenCalledWith('feature-branch');
    });

    it('should return 400 when branch name is missing', async () => {
      const requestBody = {};
      const request = new NextRequest('http://localhost/api/git/switch-branch', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Branch name is required'
      });
    });

    it('should return 400 when branch name is empty string', async () => {
      const requestBody = { branchName: '' };
      const request = new NextRequest('http://localhost/api/git/switch-branch', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Branch name is required'
      });
    });

    it('should return 409 when pending changes exist', async () => {
      const mockStatus = {
        files: ['modified-file.md', 'new-file.md']
      };
      const mockGitStatus = vi.fn().mockResolvedValue(mockStatus);
      const mockGitCheckout = vi.fn();

      vi.mocked(createGitInstance).mockResolvedValue({
        status: mockGitStatus,
        checkout: mockGitCheckout
      } as any);

      const requestBody = { branchName: 'feature-branch' };
      const request = new NextRequest('http://localhost/api/git/switch-branch', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(409);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Pending changes detected. Please commit or stash them before switching branches.'
      });
      expect(mockGitStatus).toHaveBeenCalledOnce();
      expect(mockGitCheckout).not.toHaveBeenCalled();
    });

    it('should handle git status errors', async () => {
      const mockGitStatus = vi.fn().mockRejectedValue(new Error('Git repository not found'));

      vi.mocked(createGitInstance).mockResolvedValue({
        status: mockGitStatus
      } as any);

      const requestBody = { branchName: 'feature-branch' };
      const request = new NextRequest('http://localhost/api/git/switch-branch', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to switch branch'
      });
    });

    it('should handle git checkout errors', async () => {
      const mockStatus = {
        files: []
      };
      const mockGitStatus = vi.fn().mockResolvedValue(mockStatus);
      const mockGitCheckout = vi.fn().mockRejectedValue(new Error('Branch not found'));

      vi.mocked(createGitInstance).mockResolvedValue({
        status: mockGitStatus,
        checkout: mockGitCheckout
      } as any);

      const requestBody = { branchName: 'nonexistent-branch' };
      const request = new NextRequest('http://localhost/api/git/switch-branch', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to switch branch'
      });
      expect(mockGitStatus).toHaveBeenCalledOnce();
      expect(mockGitCheckout).toHaveBeenCalledWith('nonexistent-branch');
    });

    it('should handle malformed JSON request body', async () => {
      const request = new NextRequest('http://localhost/api/git/switch-branch', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to switch branch'
      });
    });

    it('should switch to main branch successfully', async () => {
      const mockStatus = {
        files: []
      };
      const mockGitStatus = vi.fn().mockResolvedValue(mockStatus);
      const mockGitCheckout = vi.fn().mockResolvedValue(undefined);

      vi.mocked(createGitInstance).mockResolvedValue({
        status: mockGitStatus,
        checkout: mockGitCheckout
      } as any);

      const requestBody = { branchName: 'main' };
      const request = new NextRequest('http://localhost/api/git/switch-branch', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        success: true,
        message: 'Switched to branch main'
      });
      expect(mockGitCheckout).toHaveBeenCalledWith('main');
    });
  });
});
