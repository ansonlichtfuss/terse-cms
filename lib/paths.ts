import crypto from 'crypto';

import { shouldUseMockApi } from './env';

/**
 * Configuration for a single repository
 */
export interface RepositoryConfig {
  /** Unique identifier for the repository */
  id: string;
  /** Display label for the repository */
  label: string;
  /** File system path to the repository */
  path: string;
}

function encodeId(id: string) {
  return crypto.createHash('sha256').update(id).digest('hex').slice(0, 12);
}

/**
 * Parses environment variables to extract repository configurations.
 * Requires multi-repository format with numbered environment variables.
 *
 * Environment variable format:
 * - MARKDOWN_ROOT_DIR_1=/path/to/repo1
 * - MARKDOWN_ROOT_LABEL_1=Repository 1
 * - MARKDOWN_ROOT_DIR_2=/path/to/repo2
 * - MARKDOWN_ROOT_LABEL_2=Repository 2
 *
 * @returns Array of repository configurations
 * @throws Error if no repositories are configured
 */
export function getRepositoryConfig(): RepositoryConfig[] {
  const repositories: RepositoryConfig[] = [];

  if (shouldUseMockApi()) {
    // For mock API, return single mock repository
    repositories.push({
      id: 'mock',
      label: 'Mock Repository',
      path: './mock-data/filesystem'
    });
    return repositories;
  }

  // Check for multi-repository configuration
  let index = 1;
  while (true) {
    const pathKey = `MARKDOWN_ROOT_DIR_${index}`;
    const labelKey = `MARKDOWN_ROOT_LABEL_${index}`;

    const path = process.env[pathKey];
    if (!path) {
      break; // No more repositories found
    }

    const label = process.env[labelKey] || `Repository ${index}`;

    repositories.push({
      id: encodeId(path),
      label,
      path
    });

    index++;
  }

  // Throw error if no repositories are configured
  if (repositories.length === 0) {
    throw new Error(
      'No repositories configured. Please set environment variables: MARKDOWN_ROOT_DIR_1, MARKDOWN_ROOT_LABEL_1, etc.'
    );
  }

  return repositories;
}

/**
 * Gets the path for a specific repository by ID.
 *
 * @param repoId - The repository ID to get the path for
 * @returns The file system path for the repository
 * @throws Error if the repository ID is not found
 */
export function getRepositoryPath(repoId: string): string {
  const repositories = getRepositoryConfig();
  const repository = repositories.find((repo) => repo.id === repoId);

  if (!repository) {
    throw new Error(`Repository with ID '${repoId}' not found.`);
  }

  return repository.path;
}
