import { useMutation } from '@tanstack/react-query';

import { ApiClient, useApiClient, useStandardInvalidation } from './shared';

interface DeleteFileArgs {
  path: string;
}

const deleteFile = async ({ path }: DeleteFileArgs, client: ApiClient): Promise<void> => {
  await client.request('DELETE', '/api/files', { path });
};

export const useDeleteFileMutation = () => {
  const apiClient = useApiClient();
  const { invalidateFiles } = useStandardInvalidation();

  return useMutation({
    mutationFn: (args: DeleteFileArgs) => deleteFile(args, apiClient),
    onSuccess: () => invalidateFiles()
  });
};
