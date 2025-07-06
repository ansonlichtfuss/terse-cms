import simpleGit, { SimpleGitOptions } from 'simple-git';

import { getMarkdownRootDir, getRepositoryPath } from './paths';

const options: Partial<SimpleGitOptions> = {
  baseDir: getMarkdownRootDir()
};

/**
 * Gets a git instance for the default repository (backward compatibility).
 * This function maintains compatibility with existing code that doesn't specify a repository.
 *
 * @returns SimpleGit instance configured for the default repository
 */
export function getGitInstance() {
  return simpleGit(options);
}

/**
 * Gets a git instance for a specific repository.
 * This function enables git operations on multiple repositories.
 *
 * @param repoId - Optional repository ID. If not provided, uses the default repository
 * @returns SimpleGit instance configured for the specified repository
 * @throws Error if the repository ID is not found
 */
export function getGitInstanceForRepository(repoId?: string) {
  if (!repoId) {
    // Fall back to default behavior for backward compatibility
    return getGitInstance();
  }

  const repositoryPath = getRepositoryPath(repoId);
  const repositoryOptions: Partial<SimpleGitOptions> = {
    baseDir: repositoryPath
  };

  return simpleGit(repositoryOptions);
}
