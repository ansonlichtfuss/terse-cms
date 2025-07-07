import { useMutation } from '@tanstack/react-query';

import { useRepositoryFromUrl } from '@/hooks/use-repository-from-url';

import { ApiClient, useQueryInvalidation } from './shared';

interface SaveFileArgs {
  path: string;
  content: string;
}

const saveFile = async ({ path, content }: SaveFileArgs, client: ApiClient): Promise<void> => {
  await client.request('POST', '/api/files', { path, content });
};

export const useSaveFileMutation = () => {
  const { currentRepositoryId } = useRepositoryFromUrl();
  const { invalidateQuery } = useQueryInvalidation();

  return useMutation({
    mutationFn: (args: SaveFileArgs) => {
      const client = new ApiClient(currentRepositoryId);
      return saveFile(args, client);
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific file content query
      invalidateQuery(['fileContent', variables.path, currentRepositoryId]);
      // Invalidate git status
      invalidateQuery(['gitStatus', currentRepositoryId]);
    }
  });
};
