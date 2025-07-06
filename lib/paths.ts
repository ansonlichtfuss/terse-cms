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

/**
 * Gets the markdown root directory for backward compatibility.
 * This function maintains compatibility with existing single-repository setups.
 *
 * @returns The root directory path for markdown files
 */
export function getMarkdownRootDir(): string {
  const USE_MOCK_API = process.env.USE_MOCK_API === 'true';
  const MOCK_ROOT_DIR = './mock-data/filesystem';
  const MARKDOWN_ROOT_DIR = process.env.MARKDOWN_ROOT_DIR || '/';

  return USE_MOCK_API ? MOCK_ROOT_DIR : MARKDOWN_ROOT_DIR;
}

/**
 * Parses environment variables to extract repository configurations.
 * Supports both legacy single repository and new multi-repository formats.
 *
 * Environment variable format:
 * - MARKDOWN_ROOT_DIR_1=/path/to/repo1
 * - MARKDOWN_ROOT_LABEL_1=Repository 1
 * - MARKDOWN_ROOT_DIR_2=/path/to/repo2
 * - MARKDOWN_ROOT_LABEL_2=Repository 2
 *
 * @returns Array of repository configurations
 */
export function getRepositoryConfig(): RepositoryConfig[] {
  const USE_MOCK_API = process.env.USE_MOCK_API === 'true';
  const repositories: RepositoryConfig[] = [];

  if (USE_MOCK_API) {
    // For mock API, return multiple mock repositories for testing
    repositories.push({
      id: '1',
      label: 'Main Documentation',
      path: './mock-data/filesystem'
    });
    repositories.push({
      id: '2',
      label: 'API Documentation',
      path: './mock-data/filesystem'
    });
    repositories.push({
      id: '3',
      label: 'User Guides',
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
      id: index.toString(),
      label,
      path
    });

    index++;
  }

  // If no multi-repository configuration found, fall back to legacy single repository
  if (repositories.length === 0) {
    const legacyPath = process.env.MARKDOWN_ROOT_DIR || '/';
    repositories.push({
      id: 'default',
      label: 'Default Repository',
      path: legacyPath
    });
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
    throw new Error(
      `Repository with ID '${repoId}' not found. Available repositories: ${repositories.map((r) => r.id).join(', ')}`
    );
  }

  return repository.path;
}

/**
 * Gets the label for a specific repository by ID.
 *
 * @param repoId - The repository ID to get the label for
 * @returns The display label for the repository
 * @throws Error if the repository ID is not found
 */
export function getRepositoryLabel(repoId: string): string {
  const repositories = getRepositoryConfig();
  const repository = repositories.find((repo) => repo.id === repoId);

  if (!repository) {
    throw new Error(
      `Repository with ID '${repoId}' not found. Available repositories: ${repositories.map((r) => r.id).join(', ')}`
    );
  }

  return repository.label;
}

/**
 * Gets the default repository ID.
 * This is used when no specific repository is requested.
 *
 * @returns The ID of the default repository
 */
export function getDefaultRepositoryId(): string {
  const repositories = getRepositoryConfig();

  if (repositories.length === 0) {
    throw new Error('No repositories configured');
  }

  // Return the first repository as the default
  return repositories[0].id;
}
