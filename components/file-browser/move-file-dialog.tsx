'use client';

import { ChevronRight, Folder } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDirectoryQuery } from '@/hooks/api/use-directory-query';
import { useRepositoryFromUrl } from '@/hooks/use-repository-from-url';
import { cn } from '@/lib/utils';

interface S3Item {
  key: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: string;
  url?: string;
}

interface MoveFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: S3Item;
  currentPath: string;
  onMove: (destinationPath: string) => void;
  isMarkdownFile?: boolean;
  isMoving: boolean;
}

export function MoveFileDialog({
  open,
  onOpenChange,
  item,
  currentPath,
  onMove,
  isMarkdownFile = false,
  isMoving
}: MoveFileDialogProps) {
  const [dialogPath, setDialogPath] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const { currentRepositoryId } = useRepositoryFromUrl();

  const { data: directoryData, isLoading } = useDirectoryQuery(dialogPath, currentRepositoryId, { enabled: open });

  // Filter to show only directories
  const folders = directoryData?.items?.filter((item) => item.type === 'directory') || [];

  useEffect(() => {
    if (open) {
      setDialogPath(currentPath);
      setSelectedFolder(currentPath);
    }
  }, [open, currentPath]);

  const navigateToFolder = (folderPath: string) => {
    setDialogPath(folderPath);
    setSelectedFolder(folderPath || '.'); // BE wants "." for root dir
  };

  const handleMove = () => {
    onMove(selectedFolder);
  };

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

  const isItemInFolder = (itemKey: string, folderKey: string): boolean => {
    const itemName = getItemName(itemKey);
    if (isMarkdownFile) {
      // For markdown files
      if (folderKey === '') {
        // Can't move to root if already in root
        return itemKey.indexOf('/') === -1;
      }
      // Check if the itemKey is directly within the folderKey
      return itemKey === `${folderKey}/${itemName}`;
    } else {
      // For S3 items
      // Check if the itemKey is directly within the folderKey
      return itemKey === `${folderKey}${itemName}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move {item.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 min-w-0 max-w-full overflow-hidden">
          <p className="text-xs mb-3">
            Select destination folder for <span className="font-medium">{getItemName(item.key)}</span>:
          </p>

          <div className="mb-3 min-w-0 max-w-full overflow-hidden">
            <Breadcrumbs currentPath={dialogPath} onNavigate={navigateToFolder} type="files" isClickable={true} />
          </div>

          <div className="bg-muted/50 p-2 rounded-md mb-3 text-xs">
            <strong>Selected:</strong> {selectedFolder || 'Root'}
          </div>

          <div className="border rounded-md h-48">
            <div className="h-full p-2 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-1">
                  {folders.map((folder) => {
                    const isSelected = selectedFolder === folder.path;
                    const isItemInThisFolder = isItemInFolder(item.key, folder.path);

                    return (
                      <div
                        key={folder.path}
                        className={cn(
                          'flex items-start justify-between py-2 px-2 rounded-md group cursor-pointer',
                          isSelected ? 'bg-muted' : 'hover:bg-muted/50',
                          isItemInThisFolder && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={() => !isItemInThisFolder && navigateToFolder(folder.path)}
                      >
                        <div className="flex items-start min-w-0 flex-1">
                          <Folder className="h-4 w-4 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-xs break-words leading-relaxed">{folder.name}</span>
                        </div>
                        <div className="shrink-0 mt-0.5">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                  {folders.length === 0 && !isLoading && (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                      No folders in this directory
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleMove} disabled={isItemInFolder(item.key, selectedFolder) || isMoving}>
            {isMoving ? 'Moving...' : 'Move'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
