import { createQueryHook, createMutationHook, queryKeys, ApiClient } from './shared';

interface Branch {
  name: string;
  isCurrent: boolean;
}

const fetchGitBranches = async (client: ApiClient): Promise<Branch[]> => {
  const data = await client.get<{ branches: Branch[] }>('/api/git/branches');
  return data.branches;
};

const switchGitBranch = async (branchName: string, client: ApiClient): Promise<void> => {
  await client.post('/api/git/switch-branch', { branchName });
};

export const useGitBranchesQuery = createQueryHook(
  queryKeys.gitBranches,
  fetchGitBranches
);

export const useSwitchGitBranchMutation = createMutationHook(
  switchGitBranch,
  { invalidateQueries: 'git' }
);
