import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Branch {
  name: string;
  isCurrent: boolean;
}

const fetchGitBranches = async (): Promise<Branch[]> => {
  const response = await fetch("/api/git/branches");
  if (!response.ok) {
    throw new Error("Failed to fetch git branches");
  }
  const data = await response.json();
  return data.branches as Branch[];
};

const switchGitBranch = async (branchName: string): Promise<void> => {
  const response = await fetch("/api/git/switch-branch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ branchName }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to switch branch");
  }
};

export const useGitBranchesQuery = () => {
  return useQuery<Branch[], Error>({
    queryKey: ["gitBranches"], // Unique key for git branches
    queryFn: fetchGitBranches,
  });
};

export const useSwitchGitBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: switchGitBranch,
    onSuccess: () => {
      // Invalidate the gitBranches query to refetch after a successful switch
      queryClient.invalidateQueries({ queryKey: ["gitBranches"] });
    },
  });
};
