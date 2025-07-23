import { useQueryClient } from '@tanstack/react-query';

/**
 * Common query key patterns
 */
export const createQueryKey = (type: string, repositoryId?: string | null, ...additionalKeys: any[]) => {
  return [type, ...additionalKeys, repositoryId].filter(Boolean);
};

/**
 * Common query keys
 */
export const queryKeys = {
  fileTree: (repositoryId?: string | null) => createQueryKey('fileTree', repositoryId),
  files: (repositoryId?: string | null) => createQueryKey('files', repositoryId),
  directory: (directoryPath: string, repositoryId?: string | null) =>
    createQueryKey('directory', repositoryId, directoryPath),
  gitStatus: (repositoryId?: string | null) => createQueryKey('gitStatus', repositoryId),
  gitHistory: (repositoryId?: string | null) => createQueryKey('gitHistory', repositoryId),
  gitBranches: (repositoryId?: string | null) => createQueryKey('gitBranches', repositoryId),
  fileContent: (filePath: string, repositoryId?: string | null) => createQueryKey('fileContent', repositoryId, filePath)
};

/**
 * Hook for common query invalidation patterns
 */
export const useQueryInvalidation = () => {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidates file-related queries (fileTree, files, directories, gitStatus)
     */
    invalidateFileQueries: (repositoryId?: string | null) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fileTree(repositoryId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.files(repositoryId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.gitStatus(repositoryId) });
      // Invalidate all directory queries for this repository
      queryClient.invalidateQueries({
        predicate: (query) => {
          const [type, ...rest] = query.queryKey;
          return type === 'directory' && rest.includes(repositoryId);
        }
      });
    },

    /**
     * Invalidates directory queries for a specific path and its parent
     */
    invalidateDirectoryQueries: (filePath: string, repositoryId?: string | null) => {
      const directoryPath = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '';
      queryClient.invalidateQueries({ queryKey: queryKeys.directory(directoryPath, repositoryId) });

      // Also invalidate parent directory if it exists
      if (directoryPath.includes('/')) {
        const parentPath = directoryPath.substring(0, directoryPath.lastIndexOf('/'));
        queryClient.invalidateQueries({ queryKey: queryKeys.directory(parentPath, repositoryId) });
      } else if (directoryPath !== '') {
        // If we're in a subdirectory, also invalidate root
        queryClient.invalidateQueries({ queryKey: queryKeys.directory('', repositoryId) });
      }
    },

    /**
     * Invalidates git-related queries (gitStatus, gitHistory, gitBranches)
     */
    invalidateGitQueries: (repositoryId?: string | null) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gitStatus(repositoryId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.gitHistory(repositoryId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.gitBranches(repositoryId) });
    },

    /**
     * Invalidates specific query types
     */
    invalidateQuery: (queryKey: any[]) => {
      queryClient.invalidateQueries({ queryKey });
    },

    /**
     * Invalidates all queries for a repository
     */
    invalidateRepositoryQueries: (repositoryId?: string | null) => {
      if (repositoryId) {
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.includes(repositoryId)
        });
      }
    }
  };
};
