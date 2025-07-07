import { useQuery, useMutation } from '@tanstack/react-query';
import { ApiClient, queryKeys, useApiClient, useStandardInvalidation } from './shared';

const fetchGitStatus = async (client: ApiClient): Promise<string[]> => {
  // Stage all changes before fetching status
  await client.post('/api/git/stage', {});

  const data = await client.get<{ modifiedFiles: string[] }>('/api/git/status');
  return data.modifiedFiles;
};

const stageGitChanges = async (_: void, client: ApiClient): Promise<void> => {
  await client.post('/api/git/stage', {});
};

export const useGitStatusQuery = () => {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: queryKeys.gitStatus(apiClient.getRepositoryId()),
    queryFn: () => fetchGitStatus(apiClient)
  });
};

export const useStageGitChangesMutation = () => {
  const apiClient = useApiClient();
  const { invalidateGit } = useStandardInvalidation();
  
  return useMutation({
    mutationFn: () => stageGitChanges(undefined, apiClient),
    onSuccess: () => invalidateGit()
  });
};
