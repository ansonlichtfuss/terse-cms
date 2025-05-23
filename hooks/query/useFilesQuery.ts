import { useQuery } from '@tanstack/react-query';

import type { FileItem } from '@/components/file-browser/FileBrowser'; // Assuming FileItem type is accessible
import { fileNodeToFileItem } from '@/components/file-browser/utils'; // Import the utility function

interface UseFilesQueryProps {
  currentPath: string;
  type: 'files' | 'media';
}

const fetchFiles = async ({ queryKey }: any): Promise<FileItem[]> => {
  const [_key, type, path] = queryKey;

  if (type === 'files') {
    const response = await fetch('/api/files/tree');
    if (!response.ok) {
      throw new Error('Failed to fetch file tree');
    }
    const data = await response.json();
    const files = data.files || [];

    // This logic to find the current directory contents based on path
    // might need to be moved or re-evaluated depending on how the component uses the data.
    // For now, returning the full tree and letting the component filter is an option.
    // Or, the API could be modified to return contents of a specific path.
    // For this hook, we'll return the full tree for 'files' type and let the component handle filtering.
    return files.map(fileNodeToFileItem);
  } else if (type === 'media') {
    const response = await fetch(`/api/s3?path=${encodeURIComponent(path)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch media files');
    }
    const data = await response.json();
    return data.items || [];
  }

  return []; // Should not reach here
};

export const useFilesQuery = ({ currentPath, type }: UseFilesQueryProps) => {
  return useQuery<FileItem[], Error>({
    queryKey: ['files', type, currentPath], // Unique key based on type and path
    queryFn: fetchFiles
  });
};
