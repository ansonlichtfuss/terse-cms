/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the git library
vi.mock('@/lib/git', () => ({
  createGitInstance: vi.fn()
}));

import { createGitInstance } from '@/lib/git';

import { GET } from '../route';

describe('/api/git/history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return file history with commit details', async () => {
      const mockLog = {
        all: [
          {
            hash: 'abc123',
            message: 'Initial commit',
            author_name: 'John Doe',
            date: '2023-01-01T00:00:00Z'
          },
          {
            hash: 'def456',
            message: 'Update content',
            author_name: 'Jane Smith',
            date: '2023-01-02T00:00:00Z'
          }
        ]
      };

      const mockGitLog = vi.fn().mockResolvedValue(mockLog);
      const mockGitShow = vi.fn()
        .mockResolvedValueOnce(`abc123 Initial commit
 test.md | 10 +++++++++++
 1 file changed, 10 insertions(+)`)
        .mockResolvedValueOnce(`def456 Update content
 test.md | 5 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)`);

      vi.mocked(createGitInstance).mockResolvedValue({
        log: mockGitLog,
        show: mockGitShow
      } as any);

      const request = new NextRequest('http://localhost/api/git/history?filePath=test.md');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual([
        {
          hash: 'abc123',
          message: 'Initial commit',
          author: 'John Doe',
          date: '2023-01-01T00:00:00Z',
          changes: {
            files: [],
            insertions: 10,
            deletions: 0,
            totalFilesChanged: 1
          }
        },
        {
          hash: 'def456',
          message: 'Update content',
          author: 'Jane Smith',
          date: '2023-01-02T00:00:00Z',
          changes: {
            files: [],
            insertions: 5,
            deletions: 5,
            totalFilesChanged: 1
          }
        }
      ]);
      expect(mockGitLog).toHaveBeenCalledWith({ file: 'test.md' });
      expect(mockGitShow).toHaveBeenCalledTimes(2);
    });

    it('should return 400 when filePath parameter is missing', async () => {
      const request = new NextRequest('http://localhost/api/git/history');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'filePath parameter is required'
      });
    });

    it('should return 400 when filePath parameter is empty', async () => {
      const request = new NextRequest('http://localhost/api/git/history?filePath=');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'filePath parameter is required'
      });
    });

    it('should handle git log errors', async () => {
      const mockGitLog = vi.fn().mockRejectedValue(new Error('Git log failed'));

      vi.mocked(createGitInstance).mockResolvedValue({
        log: mockGitLog
      } as any);

      const request = new NextRequest('http://localhost/api/git/history?filePath=test.md');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to fetch git history'
      });
    });

    it('should handle empty git log', async () => {
      const mockLog = {
        all: []
      };

      const mockGitLog = vi.fn().mockResolvedValue(mockLog);

      vi.mocked(createGitInstance).mockResolvedValue({
        log: mockGitLog
      } as any);

      const request = new NextRequest('http://localhost/api/git/history?filePath=nonexistent.md');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual([]);
    });

    it('should handle git show errors gracefully', async () => {
      const mockLog = {
        all: [
          {
            hash: 'abc123',
            message: 'Initial commit',
            author_name: 'John Doe',
            date: '2023-01-01T00:00:00Z'
          }
        ]
      };

      const mockGitLog = vi.fn().mockResolvedValue(mockLog);
      const mockGitShow = vi.fn().mockRejectedValue(new Error('Git show failed'));

      vi.mocked(createGitInstance).mockResolvedValue({
        log: mockGitLog,
        show: mockGitShow
      } as any);

      const request = new NextRequest('http://localhost/api/git/history?filePath=test.md');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual([
        {
          hash: 'abc123',
          message: 'Initial commit',
          author: 'John Doe',
          date: '2023-01-01T00:00:00Z',
          changes: {
            files: [],
            insertions: 0,
            deletions: 0,
            totalFilesChanged: 0
          }
        }
      ]);
    });

    it('should handle complex file paths', async () => {
      const mockLog = {
        all: [
          {
            hash: 'abc123',
            message: 'Add nested file',
            author_name: 'John Doe',
            date: '2023-01-01T00:00:00Z'
          }
        ]
      };

      const mockGitLog = vi.fn().mockResolvedValue(mockLog);
      const mockGitShow = vi.fn().mockResolvedValue(`abc123 Add nested file
 docs/guides/setup.md | 25 +++++++++++++++++++++++++
 1 file changed, 25 insertions(+)`);

      vi.mocked(createGitInstance).mockResolvedValue({
        log: mockGitLog,
        show: mockGitShow
      } as any);

      const request = new NextRequest('http://localhost/api/git/history?filePath=docs/guides/setup.md');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual([
        {
          hash: 'abc123',
          message: 'Add nested file',
          author: 'John Doe',
          date: '2023-01-01T00:00:00Z',
          changes: {
            files: [],
            insertions: 25,
            deletions: 0,
            totalFilesChanged: 1
          }
        }
      ]);
      expect(mockGitLog).toHaveBeenCalledWith({ file: 'docs/guides/setup.md' });
    });

    it('should parse git show output without summary line', async () => {
      const mockLog = {
        all: [
          {
            hash: 'abc123',
            message: 'Binary file change',
            author_name: 'John Doe',
            date: '2023-01-01T00:00:00Z'
          }
        ]
      };

      const mockGitLog = vi.fn().mockResolvedValue(mockLog);
      const mockGitShow = vi.fn().mockResolvedValue(`abc123 Binary file change
 image.png | Bin 0 -> 1024 bytes
 1 file changed`);

      vi.mocked(createGitInstance).mockResolvedValue({
        log: mockGitLog,
        show: mockGitShow
      } as any);

      const request = new NextRequest('http://localhost/api/git/history?filePath=image.png');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual([
        {
          hash: 'abc123',
          message: 'Binary file change',
          author: 'John Doe',
          date: '2023-01-01T00:00:00Z',
          changes: {
            files: [],
            insertions: 0,
            deletions: 0,
            totalFilesChanged: 1
          }
        }
      ]);
    });

    it('should handle git instance creation failure', async () => {
      vi.mocked(createGitInstance).mockRejectedValue(new Error('Git instance creation failed'));

      const request = new NextRequest('http://localhost/api/git/history?filePath=test.md');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to fetch git history'
      });
    });

    it('should handle multiple files changed scenario', async () => {
      const mockLog = {
        all: [
          {
            hash: 'abc123',
            message: 'Multi-file commit',
            author_name: 'John Doe',
            date: '2023-01-01T00:00:00Z'
          }
        ]
      };

      const mockGitLog = vi.fn().mockResolvedValue(mockLog);
      const mockGitShow = vi.fn().mockResolvedValue(`abc123 Multi-file commit
 test.md | 10 +++++++++++
 another.md | 5 +++++
 15 file changed, 15 insertions(+)`);

      vi.mocked(createGitInstance).mockResolvedValue({
        log: mockGitLog,
        show: mockGitShow
      } as any);

      const request = new NextRequest('http://localhost/api/git/history?filePath=test.md');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse[0].changes.totalFilesChanged).toBe(15);
    });
  });
});