import { useMutation } from '@tanstack/react-query';

import { useRepositoryFromUrl } from '@/hooks/use-repository-from-url';
import { useQueryInvalidation } from './shared/query-utils';

interface UploadFileVariables {
  path: string;
  file: File;
}

const uploadFile = async ({ path, file }: UploadFileVariables, repositoryId?: string | null): Promise<void> => {
  const formData = new FormData();
  formData.append('path', path);
  formData.append('file', file);

  const url = new URL('/api/s3/upload', window.location.origin);
  if (repositoryId) {
    url.searchParams.set('repo', repositoryId);
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }
};

export const useUploadFileMutation = () => {
  const { currentRepositoryId } = useRepositoryFromUrl();
  const { invalidateS3Queries } = useQueryInvalidation();

  return useMutation<void, Error, UploadFileVariables>({
    mutationFn: (variables) => uploadFile(variables, currentRepositoryId),
    onSuccess: () => {
      invalidateS3Queries();
    },
  });
};
