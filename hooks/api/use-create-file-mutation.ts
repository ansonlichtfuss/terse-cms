import { useMutation } from '@tanstack/react-query';
import { ApiClient, useApiClient, useStandardInvalidation } from './shared';

interface CreateFileArgs {
  filePath: string;
  content?: string;
}

const createFile = async ({ filePath, content = '' }: CreateFileArgs, client: ApiClient): Promise<void> => {
  await client.post('/api/files', { path: filePath, content });
};

export const useCreateFileMutation = () => {
  const apiClient = useApiClient();
  const { invalidateFiles } = useStandardInvalidation();
  
  return useMutation({
    mutationFn: (args: CreateFileArgs) => createFile(args, apiClient),
    onSuccess: () => invalidateFiles()
  });
};
