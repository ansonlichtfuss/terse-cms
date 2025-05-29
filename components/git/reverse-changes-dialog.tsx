'use client';

import { Button } from '@/components/ui/button';
import { useGitStatus } from '@/context/git-status-context';

import { FileTreeDialog } from './file-tree-dialog';

interface ReverseChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevert: () => void; // Assuming a simple revert action for now
  isReverting: boolean;
}

export function ReverseChangesDialog({ open, onOpenChange, onRevert, isReverting }: ReverseChangesDialogProps) {
  const { modifiedFiles: files } = useGitStatus();
  const handleRevert = () => {
    onRevert();
  };

  return (
    <FileTreeDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Revert Changes" // Use the specific title
      files={files || []}
      footerActions={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRevert} disabled={isReverting}>
            {isReverting ? 'Reverting...' : 'Revert Changes'}
          </Button>
        </>
      }
    >
      {/* Add the warning text above the file tree */}
      <p className="text-sm text-muted-foreground mb-4">
        Are you sure you want to revert all changes? This action cannot be undone.
      </p>
    </FileTreeDialog>
  );
}
