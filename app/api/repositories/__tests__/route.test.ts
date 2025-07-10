import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/paths', () => ({
  getRepositoryConfig: vi.fn()
}));

import { getRepositoryConfig } from '@/lib/paths';

import { GET } from '../route';

describe('/api/repositories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return repository list with id and label', async () => {
      const mockRepositories = [
        {
          id: 'repo1',
          label: 'Repository 1',
          path: '/path/to/repo1'
        },
        {
          id: 'repo2',
          label: 'Repository 2',
          path: '/path/to/repo2'
        }
      ];

      vi.mocked(getRepositoryConfig).mockReturnValue(mockRepositories);

      const response = await GET();

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        repositories: [
          { id: 'repo1', label: 'Repository 1' },
          { id: 'repo2', label: 'Repository 2' }
        ]
      });
      expect(getRepositoryConfig).toHaveBeenCalledTimes(1);
    });

    it('should return single repository', async () => {
      const mockRepositories = [
        {
          id: 'single-repo',
          label: 'Single Repository',
          path: '/path/to/single/repo'
        }
      ];

      vi.mocked(getRepositoryConfig).mockReturnValue(mockRepositories);

      const response = await GET();

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        repositories: [{ id: 'single-repo', label: 'Single Repository' }]
      });
    });

    it('should return empty array when no repositories configured', async () => {
      vi.mocked(getRepositoryConfig).mockReturnValue([]);

      const response = await GET();

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        repositories: []
      });
    });

    it('should handle mock repository configuration', async () => {
      const mockRepositories = [
        {
          id: 'mock',
          label: 'Mock Repository',
          path: './mock-data/filesystem'
        }
      ];

      vi.mocked(getRepositoryConfig).mockReturnValue(mockRepositories);

      const response = await GET();

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        repositories: [{ id: 'mock', label: 'Mock Repository' }]
      });
    });

    it('should handle repositories with special characters in labels', async () => {
      const mockRepositories = [
        {
          id: 'repo-with-special',
          label: 'Repository with Special Characters & Symbols!',
          path: '/path/to/special-repo'
        }
      ];

      vi.mocked(getRepositoryConfig).mockReturnValue(mockRepositories);

      const response = await GET();

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        repositories: [{ id: 'repo-with-special', label: 'Repository with Special Characters & Symbols!' }]
      });
    });

    it('should handle getRepositoryConfig throwing error', async () => {
      vi.mocked(getRepositoryConfig).mockImplementation(() => {
        throw new Error('No repositories configured');
      });

      const response = await GET();

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to fetch repositories'
      });
    });

    it('should handle getRepositoryConfig throwing configuration error', async () => {
      vi.mocked(getRepositoryConfig).mockImplementation(() => {
        throw new Error('Invalid repository configuration');
      });

      const response = await GET();

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to fetch repositories'
      });
    });

    it('should handle getRepositoryConfig throwing filesystem error', async () => {
      vi.mocked(getRepositoryConfig).mockImplementation(() => {
        throw new Error('Permission denied accessing repository path');
      });

      const response = await GET();

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        error: 'Failed to fetch repositories'
      });
    });

    it('should filter out path property from response', async () => {
      const mockRepositories = [
        {
          id: 'test-repo',
          label: 'Test Repository',
          path: '/sensitive/path/to/repo'
        }
      ];

      vi.mocked(getRepositoryConfig).mockReturnValue(mockRepositories);

      const response = await GET();

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();

      // Verify path is not included in response
      expect(jsonResponse.repositories[0]).not.toHaveProperty('path');
      expect(jsonResponse).toEqual({
        repositories: [{ id: 'test-repo', label: 'Test Repository' }]
      });
    });

    it('should handle multiple repositories with various configurations', async () => {
      const mockRepositories = [
        {
          id: 'main-repo',
          label: 'Main Repository',
          path: '/main/repo'
        },
        {
          id: 'feature-repo',
          label: 'Feature Repository',
          path: '/feature/repo'
        },
        {
          id: 'test-repo',
          label: 'Test Repository',
          path: '/test/repo'
        }
      ];

      vi.mocked(getRepositoryConfig).mockReturnValue(mockRepositories);

      const response = await GET();

      expect(response.status).toBe(200);
      const jsonResponse = await response.json();
      expect(jsonResponse).toEqual({
        repositories: [
          { id: 'main-repo', label: 'Main Repository' },
          { id: 'feature-repo', label: 'Feature Repository' },
          { id: 'test-repo', label: 'Test Repository' }
        ]
      });
    });
  });
});
