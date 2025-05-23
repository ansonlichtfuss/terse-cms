'use client';

import { format } from 'date-fns';
import { Clock, FileText, GitCommit, User } from 'lucide-react';
import { useEffect } from 'react';

// Keep useState for other states
import { useGitHistoryQuery } from '@/hooks/query/useGitHistoryQuery';
import { formatRelativeTime } from '@/utils/date-utils';

interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
  changes: {
    files: string[];
    insertions: number;
    deletions: number;
    totalFilesChanged?: number; // Add totalFilesChanged
  };
}

interface GitHistorySidebarProps {
  filePath: string;
  isVisible: boolean;
  onClose: () => void;
  lastSaved?: Date | null;
}

export function GitHistorySidebar({ filePath, isVisible, onClose, lastSaved }: GitHistorySidebarProps) {
  const { data: commits, isLoading, error } = useGitHistoryQuery(isVisible ? filePath : ''); // Only fetch if visible and filePath exists

  // Handle error from fetching history
  useEffect(() => {
    if (error) {
      console.error('Error fetching git history:', error);
      // Optionally show a toast or handle the error in the UI
    }
  }, [error]);

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
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="overflow-y-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <div className="animate-spin mb-2">
            <GitCommit className="h-5 w-5" />
          </div>
          <p className="text-xs">Loading commit history...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {commits && commits.length > 0 ? (
            commits.map((commit) => (
              <div key={commit.hash} className="space-y-2 p-3 rounded-md border bg-card transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium">{commit.message}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono text-xs">{commit.hash.substring(0, 7)}</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {commit.author}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatRelativeTime(commit.date)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-600">+{commit.changes.insertions}</span>
                  <span className="text-red-600">-{commit.changes.deletions}</span>
                  <span className="text-muted-foreground ml-1">
                    {commit.changes.totalFilesChanged ?? commit.changes.files.length} file
                    {(commit.changes.totalFilesChanged ?? commit.changes.files.length) !== 1 ? 's' : ''}
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
            ))
          ) : (
            <div className="text-xs text-muted-foreground">No commit history found</div>
          )}
        </div>
      )}
    </div>
  );
}
