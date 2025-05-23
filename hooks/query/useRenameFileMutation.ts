import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RenameFileArgs {
  sourcePath: string;
  newName: string;
  type: 'file' | 'directory';
}

const renameFile = async ({ sourcePath, newName, type }: RenameFileArgs): Promise<void> => {
  const response = await fetch('/api/files/operations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      operation: 'rename',
      sourcePath,
      newName,
      type
    })
  });

  if (!response.ok) {
    throw new Error('Failed to rename item');
  }
};

export const useRenameFileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: renameFile,
    onSuccess: () => {
      // Invalidate the file tree query to refetch the file list
      queryClient.invalidateQueries({ queryKey: ['fileTree'] });
      // Invalidate the git status query as renaming a file affects it
      queryClient.invalidateQueries({ queryKey: ['gitStatus'] });
    }
  });
};
