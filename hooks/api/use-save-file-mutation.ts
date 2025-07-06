import { createMutationHook, ApiClient, useQueryInvalidation } from './shared';
import { useRepository } from '@/context/repository-context';
import { useMutation } from '@tanstack/react-query';

interface SaveFileArgs {
  path: string;
  content: string;
}

const saveFile = async ({ path, content }: SaveFileArgs, client: ApiClient): Promise<void> => {
  await client.post('/api/files', { path, content });
};

export const useSaveFileMutation = () => {
  const { currentRepositoryId } = useRepository();
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
