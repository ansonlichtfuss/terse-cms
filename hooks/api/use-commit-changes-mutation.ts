import { createMutationHook, ApiClient } from './shared';

const commitChanges = async (message: string, client: ApiClient): Promise<void> => {
  await client.post('/api/git/commit', { message });
};

export const useCommitChangesMutation = createMutationHook(
  commitChanges,
  { invalidateQueries: 'git' }
);
