import { useMutation } from '@tanstack/react-query';

import { ApiClient, useApiClient, useStandardInvalidation } from './shared';

interface RenameFileArgs {
  sourcePath: string;
  newName: string;
  type: 'file' | 'directory';
}

const renameFile = async ({ sourcePath, newName, type }: RenameFileArgs, client: ApiClient): Promise<void> => {
  await client.request('POST', '/api/files/rename', {
    sourcePath,
    newName,
    type
  });
};

export const useRenameFileMutation = () => {
  const apiClient = useApiClient();
  const { invalidateFiles } = useStandardInvalidation();

  return useMutation({
    mutationFn: (args: RenameFileArgs) => renameFile(args, apiClient),
    onSuccess: () => invalidateFiles()
  });
};
