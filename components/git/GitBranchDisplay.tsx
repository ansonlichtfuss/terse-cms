"use client";

import { useEffect, useState } from "react";
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

interface Branch {
  name: string;
  isCurrent: boolean;
}

export function GitBranchDisplay() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false); // State for warning dialog
  const [warningDialogMessage, setWarningDialogMessage] = useState(""); // State for warning message

  const fetchBranches = async () => {
    // Made fetchBranches a separate function
    try {
      const response = await fetch("/api/git/branches");
      const data = await response.json();
      if (response.ok) {
        setBranches(data.branches);
        const current = data.branches.find(
          (branch: Branch) => branch.isCurrent
        );
        if (current) {
          setCurrentBranch(current.name);
        } else {
          setCurrentBranch("Unknown Branch");
        }
      } else {
        setBranches([]);
        setCurrentBranch("Error");
        console.error("Failed to fetch branches:", data.error);
      }
    } catch (error) {
      setBranches([]);
      setCurrentBranch("Error");
      console.error("Failed to fetch branches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleBranchSwitch = async (branchName: string) => {
    if (branchName === currentBranch) {
      return; // Don't switch to the current branch
    }

    setIsLoading(true); // Indicate loading while switching
    try {
      const response = await fetch("/api/git/switch-branch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ branchName }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successfully switched branch, refetch branches to update display
        fetchBranches();
      } else if (response.status === 409) {
        // Pending changes detected
        setWarningDialogMessage(data.error);
        setIsWarningDialogOpen(true);
      } else {
        // Other errors
        setWarningDialogMessage(data.error || "Failed to switch branch.");
        setIsWarningDialogOpen(true);
        console.error("Failed to switch branch:", data.error);
      }
    } catch (error: any) {
      setWarningDialogMessage(error.message || "Failed to switch branch.");
      setIsWarningDialogOpen(true);
      console.error("Failed to switch branch:", error);
    } finally {
      setIsLoading(false); // End loading
    }
  };

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
            disabled={isLoading}
          >
            <GitBranch className="h-3 w-3" />
            {currentBranch}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {branches.length > 0 ? (
            branches.map((branch) => (
              <DropdownMenuItem
                key={branch.name}
                className={cn(
                  "cursor-pointer",
                  branch.isCurrent && "font-bold"
                )}
                onClick={() => handleBranchSwitch(branch.name)} // Add onClick handler
                disabled={isLoading} // Disable while loading/switching
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
