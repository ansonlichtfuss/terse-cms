import simpleGit, { SimpleGitOptions } from 'simple-git';

import { getRepositoryPath } from './paths';

/**
 * Gets a git instance for a specific repository.
 * This function enables git operations on multiple repositories.
 *
 * @param repoId - Repository ID. Required for all git operations
 * @returns SimpleGit instance configured for the specified repository
 * @throws Error if the repository ID is not found or not provided
 */
export function getGitInstanceForRepository(repoId: string) {
  if (!repoId) {
    throw new Error('Repository ID is required for git operations');
  }

  const repositoryPath = getRepositoryPath(repoId);
  const repositoryOptions: Partial<SimpleGitOptions> = {
    baseDir: repositoryPath
  };

  return simpleGit(repositoryOptions);
}
