import { createMutationHook, ApiClient } from './shared';

interface RenameFileArgs {
  sourcePath: string;
  newName: string;
  type: 'file' | 'directory';
}

const renameFile = async ({ sourcePath, newName, type }: RenameFileArgs, client: ApiClient): Promise<void> => {
  await client.post('/api/files/rename', {
    sourcePath,
    newName,
    type
  });
};

export const useRenameFileMutation = createMutationHook(
  renameFile,
  { invalidateQueries: 'file' }
);
