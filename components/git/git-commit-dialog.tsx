'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGitStatus } from '@/context/git-status-context';

import { FileTreeDialog } from './file-tree-dialog';
import styles from './git-commit-dialog.module.css';

interface GitCommitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: (message: string) => void;
  isCommitting: boolean;
}

export function GitCommitDialog({ open, onOpenChange, onCommit, isCommitting }: GitCommitDialogProps) {
  const { modifiedFiles } = useGitStatus();
  const [commitMessage, setCommitMessage] = useState(`CMS: Updated files at ${new Date().toLocaleString()}`);

  const handleCommit = () => {
    onCommit(commitMessage);
  };

  return (
    <FileTreeDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Commit Changes"
      files={modifiedFiles || []}
      footerActions={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCommit} disabled={isCommitting}>
            {isCommitting ? 'Committing...' : 'Commit Changes'}
          </Button>
        </>
      }
    >
      <div>
        <label className={styles['label-text']}>Commit Message</label>
        <Input
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          className={styles['commit-message-input']}
        />
      </div>
    </FileTreeDialog>
  );
}
