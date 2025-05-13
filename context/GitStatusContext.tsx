"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface GitStatusContextType {
  modifiedFiles: string[];
  updateGitStatus: () => Promise<void>;
}

const GitStatusContext = createContext<GitStatusContextType | undefined>(
  undefined
);

export const GitStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modifiedFiles, setModifiedFiles] = useState<string[]>([]);

  const updateGitStatus = async () => {
    try {
      // Stage all changes before fetching status
      await fetch("/api/git/stage", { method: "POST" });

      const response = await fetch("/api/git/status");
      if (!response.ok) {
        throw new Error("Failed to fetch git status");
      }
      const data = await response.json();
      setModifiedFiles(data.modifiedFiles);
    } catch (error) {
      console.error("Error updating git status:", error);
      // Optionally handle error in UI
    }
  };

  // Initial fetch of git status on provider mount
  useEffect(() => {
    updateGitStatus();
  }, []);

  return (
    <GitStatusContext.Provider value={{ modifiedFiles, updateGitStatus }}>
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
