import { useMutation } from '@tanstack/react-query';
import { ApiClient, useApiClient, useStandardInvalidation } from './shared';

interface CreateFolderArgs {
  path: string;
  name: string;
}

const createFolder = async ({ path, name }: CreateFolderArgs, client: ApiClient): Promise<void> => {
  const folderPath = path ? `${path}/${name}` : name;
  await client.post('/api/files', {
    path: folderPath,
    content: '',
    type: 'directory'
  });
};

export const useCreateFolderMutation = () => {
  const apiClient = useApiClient();
  const { invalidateFiles } = useStandardInvalidation();
  
  return useMutation({
    mutationFn: (args: CreateFolderArgs) => createFolder(args, apiClient),
    onSuccess: () => invalidateFiles()
  });
};
