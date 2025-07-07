import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';

import { useRepository } from '@/context/repository-context';

import { ApiClient } from './api-client';
import { useQueryInvalidation } from './query-utils';

/**
 * Factory for creating standardized query hooks using ApiClient
 */
export function createQueryHook<TData, TError = Error>(
  queryKey: string | ((repositoryId?: string | null) => any[]),
  queryFn: (client: ApiClient) => Promise<TData>,
  options?: Partial<UseQueryOptions<TData, TError>>
) {
  return () => {
    const { currentRepositoryId } = useRepository();

    const key = typeof queryKey === 'string' ? [queryKey, currentRepositoryId] : queryKey(currentRepositoryId);

    return useQuery<TData, TError>({
      queryKey: key,
      queryFn: () => {
        const client = new ApiClient(currentRepositoryId);
        return queryFn(client);
      },
      ...options
    });
  };
}

/**
 * Factory for creating standardized mutation hooks using ApiClient
 */
export function createMutationHook<TArgs, TData = void, TError = Error>(
  mutationFn: (args: TArgs, client: ApiClient) => Promise<TData>,
  options?: {
    invalidateQueries?: 'file' | 'git' | 'all' | ((repositoryId?: string | null) => void);
    customOptions?: Partial<UseMutationOptions<TData, TError, TArgs>>;
  }
) {
  return () => {
    const { currentRepositoryId } = useRepository();
    const { invalidateFileQueries, invalidateGitQueries, invalidateRepositoryQueries } = useQueryInvalidation();

    return useMutation<TData, TError, TArgs>({
      mutationFn: (args: TArgs) => {
        const client = new ApiClient(currentRepositoryId);
        return mutationFn(args, client);
      },
      onSuccess: (data, variables, context) => {
        // Handle query invalidation
        if (options?.invalidateQueries) {
          switch (options.invalidateQueries) {
            case 'file':
              invalidateFileQueries(currentRepositoryId);
              break;
            case 'git':
              invalidateGitQueries(currentRepositoryId);
              break;
            case 'all':
              invalidateRepositoryQueries(currentRepositoryId);
              break;
            default:
              if (typeof options.invalidateQueries === 'function') {
                options.invalidateQueries(currentRepositoryId);
              }
          }
        }

        // Call custom onSuccess if provided
        options?.customOptions?.onSuccess?.(data, variables, context);
      },
      ...options?.customOptions
    });
  };
}
