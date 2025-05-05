"use client"

import { useState, useEffect } from "react"
import { GitCommit, Clock, User, FileText } from "lucide-react"
import { formatRelativeTime } from "@/utils/date-utils"
import type { Commit } from "@/types"

interface HistoryDisplayProps {
  filePath: string
  lastSaved?: Date | null
}

export function HistoryDisplay({ filePath, lastSaved }: HistoryDisplayProps) {
  const [commits, setCommits] = useState<Commit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, fetch the git history for the file
    // For now, we'll use mock data
    setIsLoading(true)
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
      ]
      setCommits(mockCommits)
      setIsLoading(false)
    }, 800)
  }, [filePath])

  return (
    <div className="space-y-2">
      {lastSaved && (
        <div className="mb-3 text-xs text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
          <div className="animate-spin mb-2">
            <GitCommit className="h-4 w-4" />
          </div>
          <p className="text-xs">Loading history...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {commits.length > 0 ? (
            commits.map((commit) => (
              <div key={commit.hash} className="compact-history-item">
                <h4 className="font-medium">{commit.message}</h4>
                <div className="meta">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {commit.author}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatRelativeTime(commit.date)}
                  </span>
                </div>
                <div className="changes flex items-center gap-2">
                  <span className="text-green-600">+{commit.changes.insertions}</span>
                  <span className="text-red-600">-{commit.changes.deletions}</span>
                  <span className="text-muted-foreground">
                    {commit.changes.files.length > 1 ? `${commit.changes.files.length} files` : "1 file"}
                  </span>
                </div>
                {commit.changes.files.length > 1 && (
                  <div className="files text-muted-foreground">
                    {commit.changes.files.slice(0, 2).map((file) => (
                      <div key={file} className="flex items-center gap-1 truncate">
                        <FileText className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                    {commit.changes.files.length > 2 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        +{commit.changes.files.length - 2} more files
                      </div>
                    )}
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
  )
}
