import { createMutationHook, ApiClient } from './shared';

interface CreateFileArgs {
  filePath: string;
  content?: string;
}

const createFile = async ({ filePath, content = '' }: CreateFileArgs, client: ApiClient): Promise<void> => {
  await client.post('/api/files', { path: filePath, content });
};

export const useCreateFileMutation = createMutationHook(
  createFile,
  { invalidateQueries: 'file' }
);
