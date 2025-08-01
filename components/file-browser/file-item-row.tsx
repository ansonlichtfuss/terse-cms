import { File, Folder } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useRepositoryFromUrl } from '@/hooks/use-repository-from-url';
import { cn } from '@/lib/utils';

import type { FileItem } from './file-browser'; // Assuming FileItem type remains in the main file for now
import { FileItemDropdown } from './file-item-dropdown';
import styles from './file-item-row.module.css';
import { getItemName, getItemPath } from './utils'; // Import utility functions

interface FileItemRowProps {
  item: FileItem;
  isSelected: boolean;
  type: 'files' | 'media';
  onItemClick: (item: FileItem) => void;
  onDeleteClick: (item: FileItem) => void;
  onRenameClick: (item: FileItem) => void; // Add rename handler
  onMoveClick: (item: FileItem) => void; // Add move handler
  isDeleting: boolean; // Add isDeleting prop
  isRenaming: boolean; // Add isRenaming prop
  isMoving: boolean; // Add isMoving prop
}

export function FileItemRow({
  item,
  isSelected,
  type,
  onItemClick,
  onDeleteClick,
  onRenameClick, // Destructure new handlers
  onMoveClick, // Destructure new handlers
  isDeleting, // Destructure new props
  isRenaming,
  isMoving
}: FileItemRowProps) {
  const { currentRepositoryId } = useRepositoryFromUrl();
  const itemPath = getItemPath(item);
  const itemName = getItemName(item);
  const isFolder = item.type === 'folder' || item.type === 'directory';
  // const isMarkdownFile = type === 'files' && !isFolder;

  // Render Link for files when using URL routing
  const isTextFile = itemName.toLowerCase().endsWith('.md') || itemName.toLowerCase().endsWith('.txt');

  // Render Link for files when using URL routing and it's a text file
  if (!isFolder && type === 'files' && isTextFile) {
    const href = currentRepositoryId ? `/edit/${itemPath}?repo=${currentRepositoryId}` : `/edit/${itemPath}`;

    return (
      <Link
        key={itemPath}
        href={href}
        className={cn(
          styles['file-row'],
          'flex items-center justify-between py-1 px-1 rounded-md w-full',
          isSelected ? styles.selected : styles['file-row:hover']
        )}
        draggable={!isFolder}
        onDragStart={(event) => {
          event.dataTransfer.setData('text/plain', item.url || itemPath);
        }}
      >
        <div
          className={cn(
            styles['file-item'],
            'flex items-center min-w-0 overflow-hidden flex-1 pr-1 max-w-[200px]',
            isTextFile && 'pl-2'
          )}
        >
          {!isTextFile && (
            <File className={cn(styles['file-item-icon'], 'h-4 w-4 text-muted-foreground mr-1 shrink-0')} />
          )}
          <span className={cn(styles['file-item-name'], 'text-xs truncate block w-full')} title={itemName}>
            {itemName}
          </span>
        </div>

        <FileItemDropdown
          item={item}
          onMoveClick={onMoveClick}
          onRenameClick={onRenameClick}
          onDeleteClick={onDeleteClick}
          isDeleting={isDeleting} // Pass new props
          isRenaming={isRenaming}
          isMoving={isMoving}
        />
      </Link>
    );
  }

  // Render div for folders, non-text files, or when not using URL routing
  return (
    <div
      key={itemPath}
      className={cn(
        styles['file-row'],
        'flex items-center justify-between py-1 px-1 rounded-md cursor-pointer w-full',
        isSelected ? styles.selected : styles['file-row:hover']
      )}
      onClick={isFolder ? () => onItemClick(item) : undefined}
      draggable={!isFolder}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', item.url || itemPath);
      }}
    >
      <div className={cn(styles['folder-item'], 'flex items-center min-w-0 overflow-hidden flex-1 pr-1 max-w-[200px]')}>
        {isFolder ? (
          <Folder className={cn(styles['folder-item-icon'], 'h-4 w-4 text-muted-foreground mr-1 shrink-0')} />
        ) : type === 'media' && item.url && item.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div className="h-6 w-6 mr-1 shrink-0">
                <img
                  src={item.url || '/placeholder.svg'}
                  alt={itemName}
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="right" className="w-auto p-0">
              <img
                src={item.url || '/placeholder.svg'}
                alt={itemName}
                style={{ maxWidth: '300px', maxHeight: '300px' }}
              />
            </HoverCardContent>
          </HoverCard>
        ) : (
          <File className={cn(styles['file-item-icon'], 'h-4 w-4 text-muted-foreground mr-1 shrink-0')} />
        )}
        <span className={cn(styles['folder-item-name'], 'text-xs truncate block w-full')} title={itemName}>
          {itemName}
        </span>
      </div>

      <FileItemDropdown
        item={item}
        onMoveClick={onMoveClick}
        onRenameClick={onRenameClick}
        onDeleteClick={onDeleteClick}
        isDeleting={isDeleting} // Pass new props
        isRenaming={isRenaming}
        isMoving={isMoving}
      />
    </div>
  );
}

// Helper function to trigger file download
// function downloadFile(item: FileItem) {
//   console.log('Attempting to download item:', item); // Log the item object
//   const link = document.createElement('a');
//   link.href = item.url || getItemPath(item); // Use item.url if available, otherwise use itemPath
//   link.download = getItemName(item);
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }
