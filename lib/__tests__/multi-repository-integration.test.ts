import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  getDefaultRepositoryId,
  getMarkdownRootDir,
  getRepositoryConfig,
  getRepositoryLabel,
  getRepositoryPath
} from '../paths';

describe('Multi-Repository Integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should demonstrate end-to-end multi-repository configuration', () => {
    // Setup multi-repository environment
    process.env.USE_MOCK_API = 'false';
    process.env.MARKDOWN_ROOT_DIR_1 = '/path/to/docs';
    process.env.MARKDOWN_ROOT_LABEL_1 = 'Documentation';
    process.env.MARKDOWN_ROOT_DIR_2 = '/path/to/api';
    process.env.MARKDOWN_ROOT_LABEL_2 = 'API Reference';
    process.env.MARKDOWN_ROOT_DIR_3 = '/path/to/guides';
    process.env.MARKDOWN_ROOT_LABEL_3 = 'User Guides';

    // Test repository configuration discovery
    const repositories = getRepositoryConfig();
    expect(repositories).toHaveLength(3);

    expect(repositories[0]).toEqual({
      id: '1',
      label: 'Documentation',
      path: '/path/to/docs'
    });

    expect(repositories[1]).toEqual({
      id: '2',
      label: 'API Reference',
      path: '/path/to/api'
    });

    expect(repositories[2]).toEqual({
      id: '3',
      label: 'User Guides',
      path: '/path/to/guides'
    });

    // Test individual repository access
    expect(getRepositoryPath('1')).toBe('/path/to/docs');
    expect(getRepositoryPath('2')).toBe('/path/to/api');
    expect(getRepositoryPath('3')).toBe('/path/to/guides');

    expect(getRepositoryLabel('1')).toBe('Documentation');
    expect(getRepositoryLabel('2')).toBe('API Reference');
    expect(getRepositoryLabel('3')).toBe('User Guides');

    // Test default repository selection
    expect(getDefaultRepositoryId()).toBe('1');
  });

  it('should maintain backward compatibility with legacy configuration', () => {
    // Setup legacy single repository environment
    process.env.USE_MOCK_API = 'false';
    process.env.MARKDOWN_ROOT_DIR = '/legacy/docs';

    // Test that legacy function still works
    expect(getMarkdownRootDir()).toBe('/legacy/docs');

    // Test that repository config falls back to legacy
    const repositories = getRepositoryConfig();
    expect(repositories).toHaveLength(1);
    expect(repositories[0]).toEqual({
      id: 'default',
      label: 'Default Repository',
      path: '/legacy/docs'
    });

    expect(getRepositoryPath('default')).toBe('/legacy/docs');
    expect(getRepositoryLabel('default')).toBe('Default Repository');
    expect(getDefaultRepositoryId()).toBe('default');
  });

  it('should handle mixed configuration scenarios', () => {
    // Test with some repositories configured but gaps in numbering
    process.env.USE_MOCK_API = 'false';
    process.env.MARKDOWN_ROOT_DIR_1 = '/repo1';
    process.env.MARKDOWN_ROOT_LABEL_1 = 'First Repo';
    process.env.MARKDOWN_ROOT_DIR_3 = '/repo3';
    process.env.MARKDOWN_ROOT_LABEL_3 = 'Third Repo';
    // Note: no MARKDOWN_ROOT_DIR_2

    const repositories = getRepositoryConfig();
    expect(repositories).toHaveLength(1); // Should stop at first gap
    expect(repositories[0]).toEqual({
      id: '1',
      label: 'First Repo',
      path: '/repo1'
    });
  });

  it('should handle repositories without labels', () => {
    process.env.USE_MOCK_API = 'false';
    process.env.MARKDOWN_ROOT_DIR_1 = '/repo1';
    process.env.MARKDOWN_ROOT_DIR_2 = '/repo2';
    // No labels provided

    const repositories = getRepositoryConfig();
    expect(repositories).toHaveLength(2);
    expect(repositories[0].label).toBe('Repository 1');
    expect(repositories[1].label).toBe('Repository 2');
  });

  it('should handle mock API mode correctly', () => {
    process.env.USE_MOCK_API = 'true';
    // Even with multi-repo config, should use mock
    process.env.MARKDOWN_ROOT_DIR_1 = '/repo1';
    process.env.MARKDOWN_ROOT_DIR_2 = '/repo2';

    // Legacy function should return mock path
    expect(getMarkdownRootDir()).toBe('./mock-data/filesystem');

    // Repository config should return mock repository
    const repositories = getRepositoryConfig();
    expect(repositories).toHaveLength(1);
    expect(repositories[0]).toEqual({
      id: 'mock',
      label: 'Mock Repository',
      path: './mock-data/filesystem'
    });

    expect(getDefaultRepositoryId()).toBe('mock');
  });

  it('should provide helpful error messages for invalid repository IDs', () => {
    process.env.USE_MOCK_API = 'false';
    process.env.MARKDOWN_ROOT_DIR_1 = '/repo1';
    process.env.MARKDOWN_ROOT_DIR_2 = '/repo2';

    expect(() => getRepositoryPath('invalid')).toThrow("Repository with ID 'invalid' not found.");

    expect(() => getRepositoryLabel('nonexistent')).toThrow("Repository with ID 'nonexistent' not found.");
  });
});
