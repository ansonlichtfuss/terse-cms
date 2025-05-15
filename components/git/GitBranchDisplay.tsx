"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GitBranch, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/confirmation-dialog"; // Import ConfirmationDialog
import { useState } from "react"; // Import useState

// Import the new Tanstack Query hooks
import {
  useGitBranchesQuery,
  useSwitchGitBranchMutation,
} from "@/hooks/query/useGitBranches";

interface Branch {
  name: string;
  isCurrent: boolean;
}

export function GitBranchDisplay() {
  // Use the new Tanstack Query hook for fetching branches
  const { data: branches, isLoading, error } = useGitBranchesQuery();

  // Use the new Tanstack Query mutation hook for switching branches
  const {
    mutate: switchBranch,
    isPending: isSwitching,
    error: switchError,
  } = useSwitchGitBranchMutation();

  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false); // State for warning dialog
  const [warningDialogMessage, setWarningDialogMessage] = useState(""); // State for warning message

  // Determine the current branch
  const currentBranch =
    branches?.find((branch) => branch.isCurrent)?.name ||
    (isLoading ? "Loading..." : "Unknown Branch");

  const handleBranchSwitch = (branchName: string) => {
    if (branchName === currentBranch) {
      return; // Don't switch to the current branch
    }

    // Use the mutate function from the mutation hook
    switchBranch(branchName, {
      onError: (error) => {
        setWarningDialogMessage(error.message || "Failed to switch branch.");
        setIsWarningDialogOpen(true);
        console.error("Failed to switch branch:", error);
      },
    });
  };

  // Handle errors from fetching branches
  if (error) {
    return <div>Error loading branches: {error.message}</div>;
  }

  return (
    <>
      {" "}
      {/* Use a fragment to include the dialog */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            disabled={isLoading || isSwitching} // Disable while loading or switching
          >
            <GitBranch className="h-3 w-3" />
            {currentBranch}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {branches && branches.length > 0 ? (
            branches.map((branch) => (
              <DropdownMenuItem
                key={branch.name}
                className={cn(
                  "cursor-pointer",
                  branch.isCurrent && "font-bold"
                )}
                onClick={() => handleBranchSwitch(branch.name)} // Add onClick handler
                disabled={isLoading || isSwitching} // Disable while loading or switching
              >
                {branch.isCurrent && <Check className="h-3 w-3 mr-2" />}
                {branch.name}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No branches found</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Warning Dialog */}
      <ConfirmationDialog
        open={isWarningDialogOpen}
        onOpenChange={setIsWarningDialogOpen}
        title="Cannot switch branch" // Changed to sentence case
        description={warningDialogMessage}
        onConfirm={() => setIsWarningDialogOpen(false)} // Just close on confirm
        confirmLabel="OK"
        hideCancelButton={true} // Hide the cancel button
      >
        {/* No cancel button needed for this warning */}
      </ConfirmationDialog>
    </>
  );
}
