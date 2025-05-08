"use client";

import { Button } from "@/components/ui/button";
import { FileTreeDialog } from "./FileTreeDialog";

interface ReverseChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevert: () => void; // Assuming a simple revert action for now
  files: string[]; // Files to be reverted
}

export function ReverseChangesDialog({
  open,
  onOpenChange,
  onRevert,
  files,
}: ReverseChangesDialogProps) {
  const handleRevert = () => {
    onRevert();
  };

  return (
    <FileTreeDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Revert Changes" // Use the specific title
      files={files}
      footerActions={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRevert}>Revert Changes</Button>
        </>
      }
    >
      {/* Add the warning text above the file tree */}
      <p className="text-sm text-muted-foreground mb-4">
        Are you sure you want to revert all changes? This action cannot be
        undone.
      </p>
    </FileTreeDialog>
  );
}
