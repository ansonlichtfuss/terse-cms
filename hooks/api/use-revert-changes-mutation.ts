import { createMutationHook, ApiClient } from './shared';

const revertChanges = async (_: void, client: ApiClient): Promise<void> => {
  await client.post('/api/git/revert', {});
};

export const useRevertChangesMutation = createMutationHook(
  revertChanges,
  { invalidateQueries: 'git' }
);
