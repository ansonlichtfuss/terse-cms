import { useMutation } from '@tanstack/react-query';

import { ApiClient, useApiClient, useStandardInvalidation } from './shared';

const commitChanges = async (message: string, client: ApiClient): Promise<void> => {
  await client.request('POST', '/api/git/commit', { message });
};

export const useCommitChangesMutation = () => {
  const apiClient = useApiClient();
  const { invalidateGit } = useStandardInvalidation();

  return useMutation({
    mutationFn: (message: string) => commitChanges(message, apiClient),
    onSuccess: () => invalidateGit()
  });
};
