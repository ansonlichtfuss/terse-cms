import { useMutation } from '@tanstack/react-query';
import { ApiClient, useApiClient, useStandardInvalidation } from './shared';

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

export const useMoveFileMutation = () => {
  const apiClient = useApiClient();
  const { invalidateFiles } = useStandardInvalidation();
  
  return useMutation({
    mutationFn: (args: MoveFileArgs) => moveFile(args, apiClient),
    onSuccess: () => invalidateFiles()
  });
};
