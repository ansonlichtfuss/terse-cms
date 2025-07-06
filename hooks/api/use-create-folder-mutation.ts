import { createMutationHook, ApiClient } from './shared';

interface CreateFolderArgs {
  path: string;
  name: string;
}

const createFolder = async ({ path, name }: CreateFolderArgs, client: ApiClient): Promise<void> => {
  const folderPath = path ? `${path}/${name}` : name;
  await client.post('/api/files', {
    path: folderPath,
    content: '',
    type: 'directory'
  });
};

export const useCreateFolderMutation = createMutationHook(
  createFolder,
  { invalidateQueries: 'file' }
);
