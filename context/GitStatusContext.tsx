"use client";

import React, { createContext, useContext } from "react"; // Remove useState and useEffect

// Import the new Tanstack Query hooks
import {
  useGitStatusQuery,
  useStageGitChangesMutation,
} from "@/hooks/query/useGitStatus";

interface GitStatusContextType {
  modifiedFiles: string[] | undefined; // Data can be undefined initially
  isLoading: boolean;
  error: Error | null;
  updateGitStatus: () => void; // Update signature to match mutation trigger
}

const GitStatusContext = createContext<GitStatusContextType | undefined>(
  undefined,
);

export const GitStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Use the Tanstack Query hook to fetch git status
  const { data: modifiedFiles, isLoading, error } = useGitStatusQuery();

  // Use the Tanstack Query mutation hook to stage changes (which also refetches status)
  const { mutate: stageChanges } = useStageGitChangesMutation();

  // Provide the data, loading state, error, and mutation trigger via context
  const contextValue: GitStatusContextType = {
    modifiedFiles,
    isLoading,
    error,
    updateGitStatus: stageChanges, // Provide the mutation trigger as updateGitStatus
  };

  return (
    <GitStatusContext.Provider value={contextValue}>
      {children}
    </GitStatusContext.Provider>
  );
};

export const useGitStatus = () => {
  const context = useContext(GitStatusContext);
  if (context === undefined) {
    throw new Error("useGitStatus must be used within a GitStatusProvider");
  }
  return context;
};
