import { createMutationHook, ApiClient } from './shared';

interface MoveFileArgs {
  sourcePath: string;
  destinationPath: string;
  type: 'file' | 'directory';
}

const moveFile = async ({ sourcePath, destinationPath, type }: MoveFileArgs, client: ApiClient): Promise<void> => {
  await client.post('/api/files/move', {
    sourcePath,
    destinationPath,
    type
  });
};

export const useMoveFileMutation = createMutationHook(
  moveFile,
  { invalidateQueries: 'file' }
);
