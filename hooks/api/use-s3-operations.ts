import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiClient } from './shared';

interface DeleteS3ItemVariables {
  key: string;
  type: 'file' | 'folder' | 'directory';
}

interface MoveS3ItemVariables {
  sourceKey: string;
  destinationPath: string;
  type: 'file' | 'folder' | 'directory';
}

const deleteS3Item = async ({ key, type }: DeleteS3ItemVariables): Promise<void> => {
  // S3 operations don't use repository context, so no repository ID needed
  const client = new ApiClient();
  await client.request('DELETE', '/api/s3', { key, type });
};

const moveS3Item = async ({ sourceKey, destinationPath, type }: MoveS3ItemVariables): Promise<void> => {
  // S3 operations don't use repository context, so no repository ID needed
  const client = new ApiClient();
  await client.request('POST', '/api/s3/operations', {
    operation: 'move',
    sourceKey,
    destinationPath,
    type
  });
};

export const useDeleteS3ItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteS3ItemVariables>({
    mutationFn: deleteS3Item,
    onSuccess: () => {
      // Invalidate the files query for media type to refetch the list
      queryClient.invalidateQueries({ queryKey: ['files', 'media'] });
    }
  });
};

export const useMoveS3ItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, MoveS3ItemVariables>({
    mutationFn: moveS3Item,
    onSuccess: () => {
      // Invalidate the files query for media type to refetch the list
      queryClient.invalidateQueries({ queryKey: ['files', 'media'] });
    }
  });
};
