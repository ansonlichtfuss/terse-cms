import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/context/repository-context';

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
  const queryClient = useQueryClient();
  const { currentRepositoryId } = useRepository();
  
  return useMutation<void, Error, CreateS3FolderVariables>({
    mutationFn: (variables) => createS3Folder(variables, currentRepositoryId),
    onSuccess: () => {
      // Invalidate the files query for media type to refetch the list
      queryClient.invalidateQueries({ queryKey: ['files', 'media'] });
    }
  });
};