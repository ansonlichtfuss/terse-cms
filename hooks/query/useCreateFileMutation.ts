import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateFileArgs {
  filePath: string;
  content?: string;
}

const createFile = async ({
  filePath,
  content = "",
}: CreateFileArgs): Promise<void> => {
  const response = await fetch("/api/files", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path: filePath, content }),
  });

  if (!response.ok) {
    throw new Error("Failed to create file");
  }
};

export const useCreateFileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFile,
    onSuccess: () => {
      // Invalidate the file tree query to refetch the file list
      queryClient.invalidateQueries({ queryKey: ["fileTree"] });
      // Invalidate the git status query as creating a file affects it
      queryClient.invalidateQueries({ queryKey: ["gitStatus"] });
    },
  });
};
