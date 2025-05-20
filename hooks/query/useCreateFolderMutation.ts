import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateFolderArgs {
  path: string;
  name: string;
}

const createFolder = async ({
  path,
  name,
}: CreateFolderArgs): Promise<void> => {
  // This assumes a backend API endpoint for creating folders in the file system
  // If the existing API /api/files handles folder creation via POST with type: 'directory',
  // this fetch call might need adjustment. Based on useFileOperations, it seems
  // file folder creation is not yet implemented in the backend.
  // For now, I'll create a placeholder mutation.
  console.log(
    `Attempting to create folder at path: ${path} with name: ${name}`,
  );
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate success
      console.log("Folder creation simulated success");
      resolve();
      // Simulate failure
      // reject(new Error("Simulated failed to create folder"));
    }, 1000);
  });
};

export const useCreateFolderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      // Invalidate the file tree query to refetch the file list
      queryClient.invalidateQueries({ queryKey: ["fileTree"] });
      // Invalidate the git status query as creating a folder affects it
      queryClient.invalidateQueries({ queryKey: ["gitStatus"] });
    },
  });
};
