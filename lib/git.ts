import simpleGit, { SimpleGit } from 'simple-git';

import { getRepositoryConfig, getRepositoryPath } from './paths';

/**
 * Creates a validated git instance from an HTTP request.
 * Handles the full pipeline: extract repo ID, validate config, create instance, validate git repo.
 *
 * @param request - HTTP request containing repo query parameter
 * @returns Promise resolving to a validated SimpleGit instance
 * @throws Error if validation fails at any step
 */
export async function createGitInstance(request: Request): Promise<SimpleGit> {
  // Extract repo ID from request
  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get('repo');

  if (!repoId) {
    throw new Error('Repository ID is required. Please provide a "repo" query parameter.');
  }

  // Validate repo exists in config
  try {
    const repositories = getRepositoryConfig();
    const repository = repositories.find((r) => r.id === repoId);
    if (!repository) {
      throw new Error(`Invalid repository ID '${repoId}'.`);
    }
  } catch {
    throw new Error(
      'No repositories configured. Please set environment variables: MARKDOWN_ROOT_DIR_1, MARKDOWN_ROOT_LABEL_1, etc.'
    );
  }

  // Create git instance
  const repositoryPath = getRepositoryPath(repoId);
  const git = simpleGit({ baseDir: repositoryPath });

  // Validate it's a git repo
  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Not a git repository');
    }
  } catch {
    throw new Error('Failed to validate git repository');
  }

  return git;
}
