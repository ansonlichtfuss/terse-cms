import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteFileArgs {
  path: string;
}

const deleteFile = async ({ path }: DeleteFileArgs): Promise<void> => {
  const response = await fetch("/api/files", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete file");
  }
};

export const useDeleteFileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      // Invalidate the file tree query to refetch the file list
      queryClient.invalidateQueries({ queryKey: ["fileTree"] });
      // Invalidate the git status query as deleting a file affects it
      queryClient.invalidateQueries({ queryKey: ["gitStatus"] });
    },
  });
};
