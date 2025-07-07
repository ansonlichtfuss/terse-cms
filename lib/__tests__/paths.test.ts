import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getDefaultRepositoryId, getRepositoryConfig, getRepositoryLabel, getRepositoryPath } from '../paths';

describe('paths', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment variables after each test
    process.env = originalEnv;
  });

  describe('getRepositoryConfig', () => {
    it('should return mock repository when USE_MOCK_API is true', () => {
      process.env.USE_MOCK_API = 'true';
      const config = getRepositoryConfig();

      expect(config).toHaveLength(1);
      expect(config[0]).toEqual({
        id: 'mock',
        label: 'Mock Repository',
        path: './mock-data/filesystem'
      });
    });

    it('should return multi-repository configuration when numbered env vars are present', () => {
      process.env.USE_MOCK_API = 'false';
      process.env.MARKDOWN_ROOT_DIR_1 = '/repo1/path';
      process.env.MARKDOWN_ROOT_LABEL_1 = 'Repository One';
      process.env.MARKDOWN_ROOT_DIR_2 = '/repo2/path';
      process.env.MARKDOWN_ROOT_LABEL_2 = 'Repository Two';

      const config = getRepositoryConfig();

      expect(config).toHaveLength(2);
      expect(config[0]).toEqual({
        id: '1',
        label: 'Repository One',
        path: '/repo1/path'
      });
      expect(config[1]).toEqual({
        id: '2',
        label: 'Repository Two',
        path: '/repo2/path'
      });
    });

    it('should use default labels when labels are not provided', () => {
      process.env.USE_MOCK_API = 'false';
      process.env.MARKDOWN_ROOT_DIR_1 = '/repo1/path';
      process.env.MARKDOWN_ROOT_DIR_2 = '/repo2/path';

      const config = getRepositoryConfig();

      expect(config).toHaveLength(2);
      expect(config[0].label).toBe('Repository 1');
      expect(config[1].label).toBe('Repository 2');
    });
  });

  describe('getRepositoryPath', () => {
    beforeEach(() => {
      process.env.USE_MOCK_API = 'false';
      process.env.MARKDOWN_ROOT_DIR_1 = '/repo1/path';
      process.env.MARKDOWN_ROOT_LABEL_1 = 'Repository One';
      process.env.MARKDOWN_ROOT_DIR_2 = '/repo2/path';
      process.env.MARKDOWN_ROOT_LABEL_2 = 'Repository Two';
    });

    it('should return correct path for valid repository ID', () => {
      expect(getRepositoryPath('1')).toBe('/repo1/path');
      expect(getRepositoryPath('2')).toBe('/repo2/path');
    });

    it('should throw error for invalid repository ID', () => {
      expect(() => getRepositoryPath('invalid')).toThrow("Repository with ID 'invalid' not found.");
    });
  });

  describe('getRepositoryLabel', () => {
    beforeEach(() => {
      process.env.USE_MOCK_API = 'false';
      process.env.MARKDOWN_ROOT_DIR_1 = '/repo1/path';
      process.env.MARKDOWN_ROOT_LABEL_1 = 'Repository One';
      process.env.MARKDOWN_ROOT_DIR_2 = '/repo2/path';
      process.env.MARKDOWN_ROOT_LABEL_2 = 'Repository Two';
    });

    it('should return correct label for valid repository ID', () => {
      expect(getRepositoryLabel('1')).toBe('Repository One');
      expect(getRepositoryLabel('2')).toBe('Repository Two');
    });

    it('should throw error for invalid repository ID', () => {
      expect(() => getRepositoryLabel('invalid')).toThrow("Repository with ID 'invalid' not found.");
    });
  });

  describe('getDefaultRepositoryId', () => {
    it('should return first repository ID when multiple repositories are configured', () => {
      process.env.USE_MOCK_API = 'false';
      process.env.MARKDOWN_ROOT_DIR_1 = '/repo1/path';
      process.env.MARKDOWN_ROOT_DIR_2 = '/repo2/path';

      expect(getDefaultRepositoryId()).toBe('1');
    });

    it('should return "default" for legacy single repository configuration', () => {
      process.env.USE_MOCK_API = 'false';
      process.env.MARKDOWN_ROOT_DIR = '/legacy/path';

      expect(getDefaultRepositoryId()).toBe('default');
    });

    it('should return "mock" when using mock API', () => {
      process.env.USE_MOCK_API = 'true';

      expect(getDefaultRepositoryId()).toBe('mock');
    });
  });
});
