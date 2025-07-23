import { useMutation } from '@tanstack/react-query';

import { useRepositoryFromUrl } from '@/hooks/use-repository-from-url';

import { useQueryInvalidation } from './shared/query-utils';

interface CreateS3FolderVariables {
  path: string;
  name: string;
}

const createS3Folder = async ({ path, name }: CreateS3FolderVariables, repositoryId?: string | null): Promise<void> => {
  const url = new URL('/api/s3/folder', window.location.origin);
  if (repositoryId) {
    url.searchParams.set('repo', repositoryId);
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      path,
      name
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create folder');
  }
};

export const useCreateS3FolderMutation = () => {
  const { currentRepositoryId } = useRepositoryFromUrl();
  const { invalidateS3Queries } = useQueryInvalidation();

  return useMutation<void, Error, CreateS3FolderVariables>({
    mutationFn: (variables) => createS3Folder(variables, currentRepositoryId),
    onSuccess: () => {
      invalidateS3Queries();
    }
  });
};
