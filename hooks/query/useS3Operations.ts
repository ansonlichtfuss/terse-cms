import { useMutation, useQueryClient } from "@tanstack/react-query";

// Assuming FileItem type is accessible

interface DeleteS3ItemVariables {
  key: string;
  type: "file" | "folder" | "directory";
}

interface MoveS3ItemVariables {
  sourceKey: string;
  destinationPath: string;
  type: "file" | "folder" | "directory";
}

const deleteS3Item = async ({
  key,
  type,
}: DeleteS3ItemVariables): Promise<void> => {
  const response = await fetch("/api/s3", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key, type }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete S3 item");
  }
};

const moveS3Item = async ({
  sourceKey,
  destinationPath,
  type,
}: MoveS3ItemVariables): Promise<void> => {
  const response = await fetch("/api/s3/operations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation: "move",
      sourceKey,
      destinationPath,
      type,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to move S3 item");
  }
};

export const useDeleteS3ItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteS3ItemVariables>({
    mutationFn: deleteS3Item,
    onSuccess: () => {
      // Invalidate the files query for media type to refetch the list
      // This assumes the file browser is displaying media files
      queryClient.invalidateQueries({ queryKey: ["files", "media"] });
    },
  });
};

export const useMoveS3ItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, MoveS3ItemVariables>({
    mutationFn: moveS3Item,
    onSuccess: () => {
      // Invalidate the files query for media type to refetch the list
      // This assumes the file browser is displaying media files
      queryClient.invalidateQueries({ queryKey: ["files", "media"] });
    },
  });
};
