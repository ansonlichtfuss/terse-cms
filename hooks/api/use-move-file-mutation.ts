import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MoveFileArgs {
  sourcePath: string;
  destinationPath: string;
  type: 'file' | 'directory';
}

const moveFile = async ({ sourcePath, destinationPath, type }: MoveFileArgs): Promise<void> => {
  const response = await fetch('/api/files/operations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      operation: 'move',
      sourcePath,
      destinationPath,
      type
    })
  });

  if (!response.ok) {
    throw new Error('Failed to move file');
  }
};

export const useMoveFileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moveFile,
    onSuccess: () => {
      // Invalidate the file tree query to refetch the file list
      queryClient.invalidateQueries({ queryKey: ['fileTree'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      // Invalidate the git status query as moving a file affects it
      queryClient.invalidateQueries({ queryKey: ['gitStatus'] });
    }
  });
};
