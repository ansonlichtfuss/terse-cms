"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GitCommit, Clock, User, FileText, X } from "lucide-react";
import { format } from "date-fns";

interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
  changes: {
    files: string[];
    insertions: number;
    deletions: number;
  };
}

interface GitHistorySidebarProps {
  filePath: string;
  isVisible: boolean;
  onClose: () => void;
}

export function GitHistorySidebar({
  filePath,
  isVisible,
  onClose,
}: GitHistorySidebarProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      // In a real implementation, fetch the git history for the file
      // For now, we'll use mock data
      setIsLoading(true);
      setTimeout(() => {
        const mockCommits: Commit[] = [
          {
            hash: "a1b2c3d",
            message: "Update content and metadata",
            author: "John Doe",
            date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            changes: {
              files: [filePath],
              insertions: 12,
              deletions: 5,
            },
          },
          {
            hash: "e4f5g6h",
            message: "Fix typos and formatting",
            author: "Jane Smith",
            date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
            changes: {
              files: [filePath, "another-file.md"],
              insertions: 7,
              deletions: 7,
            },
          },
          {
            hash: "i7j8k9l",
            message: "Add new section on advanced features",
            author: "John Doe",
            date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            changes: {
              files: [filePath],
              insertions: 45,
              deletions: 0,
            },
          },
          {
            hash: "m1n2o3p",
            message: "Initial commit",
            author: "Jane Smith",
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
            changes: {
              files: [filePath, "README.md", "config.json"],
              insertions: 120,
              deletions: 0,
            },
          },
        ];
        setCommits(mockCommits);
        setIsLoading(false);
      }, 800);
    }
  }, [isVisible, filePath]);

  if (!isVisible) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
      } else {
        return format(date, "MMM d, yyyy");
      }
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="w-72 border-l relative animate-slide-in">
      <div className="p-3 border-b flex items-center justify-between bg-gradient-secondary">
        <div className="flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">File History</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-[calc(100vh-10rem)] overflow-y-auto">
        <div className="p-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <div className="animate-spin mb-2">
                <GitCommit className="h-5 w-5" />
              </div>
              <p className="text-xs">Loading commit history...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commits.map((commit) => (
                <div
                  key={commit.hash}
                  className="space-y-2 p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">{commit.message}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">
                          {commit.hash.substring(0, 7)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {commit.author}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(commit.date)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-600">
                      +{commit.changes.insertions}
                    </span>
                    <span className="text-red-600">
                      -{commit.changes.deletions}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {commit.changes.files.length} file
                      {commit.changes.files.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {commit.changes.files.length > 1 && (
                    <div className="text-xs text-muted-foreground space-y-1 mt-2">
                      {commit.changes.files.map((file) => (
                        <div key={file} className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span className="truncate">{file}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
