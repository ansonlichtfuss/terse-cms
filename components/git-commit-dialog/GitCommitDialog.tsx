"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModifiedFilesTree } from "./ModifiedFilesTree";
import styles from "./gitCommitDialog.module.css";

interface GitCommitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: (message: string) => void;
  modifiedFiles?: string[];
}

export function GitCommitDialog({
  open,
  onOpenChange,
  onCommit,
  modifiedFiles = [],
}: GitCommitDialogProps) {
  const [commitMessage, setCommitMessage] = useState(
    `CMS: Updated files at ${new Date().toLocaleString()}`
  );

  const handleCommit = () => {
    onCommit(commitMessage);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle className={styles.dialogTitle}>
            Commit Changes
          </DialogTitle>
        </DialogHeader>
        <div className={styles.contentArea}>
          <div>
            <label className={styles.labelText}>Commit Message</label>
            <Input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className={styles.commitMessageInput}
            />
          </div>

          <div>
            <label className={styles.labelText}>
              Modified Files ({modifiedFiles.length})
            </label>
            <ModifiedFilesTree modifiedFiles={modifiedFiles} />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className={styles.dialogButton}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCommit}
            size="sm"
            className={styles.dialogButton}
          >
            Commit Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
