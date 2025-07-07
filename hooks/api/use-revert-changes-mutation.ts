import { useMutation } from '@tanstack/react-query';
import { ApiClient, useApiClient, useStandardInvalidation } from './shared';

const revertChanges = async (_: void, client: ApiClient): Promise<void> => {
  await client.post('/api/git/revert', {});
};

export const useRevertChangesMutation = () => {
  const apiClient = useApiClient();
  const { invalidateGit } = useStandardInvalidation();
  
  return useMutation({
    mutationFn: () => revertChanges(undefined, apiClient),
    onSuccess: () => invalidateGit()
  });
};
