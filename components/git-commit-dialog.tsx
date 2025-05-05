"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GitCommitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommit: (message: string) => void
  modifiedFiles: string[]
}

export function GitCommitDialog({ open, onOpenChange, onCommit, modifiedFiles }: GitCommitDialogProps) {
  const [commitMessage, setCommitMessage] = useState(`CMS: Updated files at ${new Date().toLocaleString()}`)

  const handleCommit = () => {
    onCommit(commitMessage)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Commit Changes</DialogTitle>
        </DialogHeader>
        <div className="py-3 space-y-3">
          <div>
            <label className="text-xs font-medium">Commit Message</label>
            <Input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="mt-1 h-7 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium">Modified Files ({modifiedFiles.length})</label>
            <ScrollArea className="h-[150px] mt-1 border rounded-md p-2">
              <ul className="space-y-1">
                {modifiedFiles.map((file, index) => (
                  <li key={index} className="text-xs truncate">
                    {file}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-7 text-xs">
            Cancel
          </Button>
          <Button onClick={handleCommit} size="sm" className="h-7 text-xs">
            Commit Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
