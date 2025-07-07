import { useMutation, useQuery } from '@tanstack/react-query';

import { ApiClient, queryKeys, useApiClient, useStandardInvalidation } from './shared';

interface Branch {
  name: string;
  isCurrent: boolean;
}

const fetchGitBranches = async (client: ApiClient): Promise<Branch[]> => {
  const data = await client.request<{ branches: Branch[] }>('GET', '/api/git/branches');
  return data.branches;
};

const switchGitBranch = async (branchName: string, client: ApiClient): Promise<void> => {
  await client.request('POST', '/api/git/switch-branch', { branchName });
};

export const useGitBranchesQuery = () => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: queryKeys.gitBranches(apiClient.getRepositoryId()),
    queryFn: () => fetchGitBranches(apiClient)
  });
};

export const useSwitchGitBranchMutation = () => {
  const apiClient = useApiClient();
  const { invalidateGit } = useStandardInvalidation();

  return useMutation({
    mutationFn: (branchName: string) => switchGitBranch(branchName, apiClient),
    onSuccess: () => invalidateGit()
  });
};
