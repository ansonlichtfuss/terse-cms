import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { ModifiedFilesTree } from './modified-files-tree'; // Assuming ModifiedFilesTree can be reused

interface FileTreeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  files: string[];
  footerActions: React.ReactNode;
  children?: React.ReactNode; // To include additional content above the file tree
}

export function FileTreeDialog({ open, onOpenChange, title, files, footerActions, children }: FileTreeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="content-area">
          {' '}
          {/* Add a class for styling */}
          {children} {/* Render additional content here */}
          <ModifiedFilesTree modifiedFiles={files} />
        </div>
        <DialogFooter>
          {footerActions} {/* Render footer actions here */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
