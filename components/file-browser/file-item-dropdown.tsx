import { MoreHorizontal } from 'lucide-react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import type { FileItem } from './file-browser';

interface FileItemDropdownProps {
  item: FileItem;
  onMoveClick: (item: FileItem) => void;
  onRenameClick: (item: FileItem) => void;
  onDeleteClick: (item: FileItem) => void;
  isDeleting: boolean;
  isRenaming: boolean;
  isMoving: boolean;
}

export function FileItemDropdown({
  item,
  onMoveClick,
  onRenameClick,
  onDeleteClick,
  isDeleting,
  isRenaming,
  isMoving
}: FileItemDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {item.type !== 'folder' && item.type !== 'directory' && (
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              onMoveClick(item);
            }}
            disabled={isMoving}
          >
            Move
          </DropdownMenuItem>
        )}
        {item.type === 'file' && (
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              const link = document.createElement('a');
              link.href = item.url || item.path || item.key;
              link.download = item.name || 'download';
              link.target = '_blank';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            onRenameClick(item);
          }}
          disabled={isRenaming}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            onDeleteClick(item);
          }}
          className="dropdown-menu-item-destructive"
          disabled={isDeleting}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
