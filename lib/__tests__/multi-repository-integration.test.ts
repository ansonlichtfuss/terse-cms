import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getRepositoryConfig, getRepositoryPath } from '../paths';

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
      id: 'e0d8f6937e55',
      label: 'Documentation',
      path: '/path/to/docs'
    });

    expect(repositories[1]).toEqual({
      id: '2ec99c797e1d',
      label: 'API Reference',
      path: '/path/to/api'
    });

    expect(repositories[2]).toEqual({
      id: 'cbe3c9b9b692',
      label: 'User Guides',
      path: '/path/to/guides'
    });

    // Test individual repository access
    expect(getRepositoryPath('e0d8f6937e55')).toBe('/path/to/docs');
    expect(getRepositoryPath('2ec99c797e1d')).toBe('/path/to/api');
    expect(getRepositoryPath('cbe3c9b9b692')).toBe('/path/to/guides');
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
      id: 'daa731b185d2',
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

    // Repository config should return mock repository
    const repositories = getRepositoryConfig();
    expect(repositories).toHaveLength(1);
    expect(repositories[0]).toEqual({
      id: 'mock',
      label: 'Mock Repository',
      path: './mock-data/filesystem'
    });
  });

  it('should provide helpful error messages for invalid repository IDs', () => {
    process.env.USE_MOCK_API = 'false';
    process.env.MARKDOWN_ROOT_DIR_1 = '/repo1';
    process.env.MARKDOWN_ROOT_DIR_2 = '/repo2';

    expect(() => getRepositoryPath('invalid')).toThrow("Repository with ID 'invalid' not found.");
  });
});
