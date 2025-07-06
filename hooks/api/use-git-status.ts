import { createQueryHook, createMutationHook, queryKeys, ApiClient } from './shared';

const fetchGitStatus = async (client: ApiClient): Promise<string[]> => {
  // Stage all changes before fetching status
  await client.post('/api/git/stage', {});
  
  const data = await client.get<{ modifiedFiles: string[] }>('/api/git/status');
  return data.modifiedFiles;
};

const stageGitChanges = async (_: void, client: ApiClient): Promise<void> => {
  await client.post('/api/git/stage', {});
};

export const useGitStatusQuery = createQueryHook(
  queryKeys.gitStatus,
  fetchGitStatus
);

export const useStageGitChangesMutation = createMutationHook(
  stageGitChanges,
  { invalidateQueries: 'git' }
);
