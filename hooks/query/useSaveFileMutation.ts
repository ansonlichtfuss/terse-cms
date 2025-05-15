import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SaveFileArgs {
  path: string;
  content: string;
}

const saveFile = async ({ path, content }: SaveFileArgs): Promise<void> => {
  const response = await fetch("/api/files", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path, content }),
  });

  if (!response.ok) {
    throw new Error("Failed to save file");
  }
};

export const useSaveFileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveFile,
    onSuccess: (_, variables) => {
      // Invalidate the file content query for the saved file to refetch
      queryClient.invalidateQueries({
        queryKey: ["fileContent", variables.path],
      });
      // Optionally invalidate git status if saving a file affects it
      queryClient.invalidateQueries({ queryKey: ["gitStatus"] });
    },
  });
};
