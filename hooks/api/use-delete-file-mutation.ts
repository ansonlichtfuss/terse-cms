import { createMutationHook, ApiClient } from './shared';

interface DeleteFileArgs {
  path: string;
}

const deleteFile = async ({ path }: DeleteFileArgs, client: ApiClient): Promise<void> => {
  await client.delete('/api/files', { path });
};

export const useDeleteFileMutation = createMutationHook(
  deleteFile,
  { invalidateQueries: 'file' }
);
