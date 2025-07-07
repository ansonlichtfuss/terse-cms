import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'; // Import necessary types
import { FilePlus, FolderPlus, RefreshCw, Upload } from 'lucide-react'; // Added FilePlus icon
import { useRouter } from 'next/navigation'; // Import useRouter
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRepository } from '@/context/repository-context';
import { cn } from '@/lib/utils';

import type { FileItem } from './file-browser'; // Import FileItem type
import { useFileOperations } from './hooks/use-file-operations'; // Import useFileOperations
import { SortDropdown } from './sort-dropdown';
import type { SortConfig } from './types/sorting';

interface FileBrowserActionsProps {
  type: 'files' | 'media';
  isUploading: boolean;
  onRefresh: () => void;
  onNewFolderClick: () => void;
  onOpenUploadDialog: () => void; // New prop to open the upload dialog
  currentPath: string; // Add currentPath prop
  isCreatingFolder: boolean; // Add isCreatingFolder prop
  fetchItems: (options?: RefetchOptions) => Promise<QueryObserverResult<FileItem[], Error>>; // Add fetchItems prop
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

export function FileBrowserActions({
  type,
  isUploading,
  onRefresh,
  onNewFolderClick,
  onOpenUploadDialog, // Destructure the new prop
  currentPath, // Destructure currentPath
  isCreatingFolder, // Destructure isCreatingFolder
  fetchItems, // Destructure fetchItems
  sortConfig,
  onSortChange
}: FileBrowserActionsProps) {
  const router = useRouter(); // Initialize useRouter
  const { currentRepositoryId } = useRepository();
  // Remove useFileFetching and its usage
  // const { currentDirContents, fetchItems } = useFileFetching({
  //   currentPath,
  //   type,
  // }); // Get current directory contents and fetchItems
  const { handleCreateFile } = useFileOperations({
    currentPath,
    type,
    fetchItems, // Pass fetchItems received as prop
    deleteDialog: {
      isOpen: false,
      item: null,
      openDialog: () => {},
      closeDialog: () => {}
    } // Dummy dialog object
  }); // Get handleCreateFile from useFileOperations

  const handleNewFileClick = async () => {
    // Make the function async
    let newFileName = 'untitled.md';
    let counter = 0;
    let fileExists = true;

    const currentFiles = (await fetchItems()).data; // Fetch current files

    while (fileExists) {
      const fileNameToCheck = counter === 0 ? 'untitled.md' : `untitled-${counter}.md`;
      fileExists = !!currentFiles?.some((file) => file.name === fileNameToCheck);
      if (fileExists) {
        counter++;
      } else {
        newFileName = fileNameToCheck;
      }
    }

    const newFilePath = `${currentPath ? `${currentPath}/` : ''}${newFileName}`;

    try {
      await handleCreateFile(newFilePath, ''); // Create the file and await completion
      const href = currentRepositoryId ? `/edit/${newFilePath}?repo=${currentRepositoryId}` : `/edit/${newFilePath}`;
      router.push(href); // Redirect after file creation and refresh
    } catch (error) {
      console.error('Failed to create new file:', error);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('relative', 'mb-2 mx-3', 'p-1 border rounded-md bg-gradient-secondary')}>
        <div className={cn('flex', 'gap-1', 'justify-center')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onRefresh} className="shrink-0 h-7 w-7">
                <RefreshCw className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Refresh</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewFolderClick}
                className="shrink-0 h-7 w-7"
                disabled={isCreatingFolder} // Disable while creating folder
              >
                <FolderPlus className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>New Folder</p>
            </TooltipContent>
          </Tooltip>

          <SortDropdown sortConfig={sortConfig} onSortChange={onSortChange} type={type} />
        </div>
        <div className="absolute right-1 top-1">
          {type === 'media' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onOpenUploadDialog} // Call the new prop to open the dialog
                    disabled={isUploading}
                    className="h-7 w-7"
                  >
                    <Upload className="h-3 w-3" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Upload File</p>
              </TooltipContent>
            </Tooltip>
          )}

          {type === 'files' && ( // Only show for file browser
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Use a Button component for action */}
                <Button
                  variant="outline" // Use ghost variant for styling
                  size="icon" // Use icon size
                  onClick={handleNewFileClick} // Call the handler
                  className="shrink-0 h-7 w-7" // Ensure correct size
                >
                  <FilePlus className="h-3 w-3" /> {/* Use FilePlus icon */}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>New File</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
