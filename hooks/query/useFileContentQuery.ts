import { useQuery } from "@tanstack/react-query";

import type { FileData } from "@/types";

const fetchFileContent = async (path: string): Promise<FileData> => {
  const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
  if (!response.ok) {
    throw new Error(`Error fetching file content: ${response.statusText}`);
  }
  const data = await response.json();
  return {
    path,
    content: data.content,
    isModified: false, // Assuming fetched file is not modified initially
  };
};

export const useFileContentQuery = (filePath: string) => {
  return useQuery({
    queryKey: ["fileContent", filePath],
    queryFn: () => fetchFileContent(filePath),
    enabled: !!filePath, // Only run the query if filePath is provided
  });
};
