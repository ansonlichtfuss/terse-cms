'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface S3Item {
  key: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: string;
  url?: string;
}

interface RenameFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: S3Item;
  onRename: (newName: string) => void;
  isMarkdownFile?: boolean;
  isFileOpen?: boolean;
  isRenaming: boolean; // Add isRenaming prop
}

export function RenameFileDialog({
  open,
  onOpenChange,
  item,
  onRename,
  isMarkdownFile = false,
  isFileOpen = false,
  isRenaming // Destructure isRenaming
}: RenameFileDialogProps) {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (open && item) {
      // Extract the current name from the key
      const name = getItemName(item.key);
      setNewName(name);
    }
  }, [open, item]);

  const getItemName = (key: string): string => {
    if (isMarkdownFile) {
      // For markdown files, the key is the full path
      const parts = key.split('/');
      return parts[parts.length - 1] || 'Root';
    } else {
      // For S3 items, remove trailing slash for folders
      const cleanKey = key.endsWith('/') ? key.slice(0, -1) : key;
      // Get the last part of the path
      const parts = cleanKey.split('/');
      return parts[parts.length - 1] || 'Root';
    }
  };

  const handleRename = () => {
    if (newName.trim()) {
      onRename(newName.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename {item.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs">
              New name
            </Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              className="h-8 text-xs"
              autoFocus
            />
          </div>
        </div>
        {isFileOpen && (
          <div className="text-sm text-red-500 mb-4">
            Warning: Renaming this file will close the current editor tab and any unsaved changes will be lost.
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleRename}
            disabled={!newName.trim() || newName === getItemName(item.key) || isRenaming} // Disable while renaming
          >
            {isRenaming ? 'Renaming...' : 'Rename'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
