'use client';

import { Clock, Edit2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { EditorContent, handleToolbarAction } from '@/components/editor/editor-content';
import { EditorToolbar } from '@/components/editor/editor-toolbar';
import { FileDetailSidebar } from '@/components/file-detail-sidebar';
import { RenameFileDialog } from '@/components/rename-file-dialog';
import { useGitStatus } from '@/context/git-status-context';
import { useDialogState } from '@/hooks/ui/use-dialog-state';
import { getUserPreferences, saveUserPreferences } from '@/lib/user-preferences';
import type { FileData } from '@/types';
import { formatModificationTime } from '@/utils/date-utils';

import { useFileOperations } from '../file-browser/hooks/use-file-operations';

interface EditorProps {
  file: FileData;
  onSave: (path: string, content: string) => void;
}

export function Editor({ file, onSave }: EditorProps) {
  const [content, setContent] = useState('');
  const [fileModificationTime, setFileModificationTime] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const mediaDialog = useDialogState();
  const renameDialog = useDialogState();
  const { updateGitStatus } = useGitStatus();

  // Reference to the textarea element
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use refs to track the previous file and whether we're currently saving
  const prevFileRef = useRef<FileData | null>(null);
  const isSavingRef = useRef(false);
  const initialLoadRef = useRef(true);

  // Create a stable debounced save function
  const [debouncedSave] = useDebounce(async (path: string, content: string) => {
    isSavingRef.current = true;
    await onSave(path, content); // Assuming onSave is async and awaits the save operation
    setFileModificationTime(new Date().toISOString());
    // Update git status after saving
    updateGitStatus();
    setTimeout(() => {
      isSavingRef.current = false;
    }, 100);
  }, 1000);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    // Only auto-save if we're past the initial load
    if (!initialLoadRef.current && file) {
      debouncedSave(file.path, newContent);
    }
  };

  const handleToolbarActionClick = (
    action: string,
    value?: string,
    toolbarTextareaRef?: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    if (!toolbarTextareaRef?.current) {
      console.error('Textarea ref is null');
      return;
    }

    const newContent = handleToolbarAction(action, value, toolbarTextareaRef, content, handleContentChange);

    // Auto-save the updated content
    if (!initialLoadRef.current && file && newContent !== content) {
      debouncedSave(file.path, newContent);
    }
  };

  // Safely get the filename from the path
  const getFileName = () => {
    if (!file || !file.path) return 'Untitled';
    const pathParts = file.path.split('/');
    return pathParts[pathParts.length - 1] || 'Untitled';
  };

  // Load user preferences on mount
  useEffect(() => {
    const preferences = getUserPreferences();
    setIsSidebarVisible(preferences.isSidebarVisible);
  }, []);

  // Save sidebar visibility preference when it changes
  useEffect(() => {
    if (!initialLoadRef.current) {
      saveUserPreferences({ isSidebarVisible });
    }
  }, [isSidebarVisible]);

  // Update local state when file prop changes, but only if it's actually different
  useEffect(() => {
    // Skip if we're currently in the process of saving
    if (isSavingRef.current) return;

    // Skip if the file hasn't changed
    if (
      prevFileRef.current &&
      file &&
      prevFileRef.current.path === file.path &&
      prevFileRef.current.content === file.content
    ) {
      return;
    }

    // Update the content state
    if (file) {
      setContent(file.content || '');
      setFileModificationTime(file.lastModified || null);
      prevFileRef.current = file;
    }

    // After initial load, we can start auto-saving
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
    }
  }, [file]);

  // Use the file operations hook
  const { handleRename, isRenamingFile } = useFileOperations({
    type: 'files', // Assuming editor only deals with 'files' type
    currentPath: file?.path || '', // Pass the current file path
    deleteDialog: {
      isOpen: false,
      item: null,
      openDialog: () => {},
      closeDialog: () => {}
    } // Dummy dialog object
  });
  return (
    <div className="h-full flex gap-2 pr-2 pb-2">
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="border rounded-md p-2 flex items-center justify-between bg-gradient-secondary mb-2">
          <div className="flex-1 truncate">
            <h2
              className="text-sm font-semibold truncate flex items-center cursor-pointer hover:text-primary"
              onClick={() => renameDialog.openDialog()}
            >
              {getFileName()} <Edit2 className="h-3 w-3 ml-1 opacity-50" />
            </h2>
          </div>
          {/* File modification timestamp */}
          <span className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {fileModificationTime ? formatModificationTime(fileModificationTime) : 'No modification time'}
          </span>
        </div>

        <EditorToolbar
          onAction={handleToolbarActionClick}
          onImageClick={() => mediaDialog.openDialog()}
          textareaRef={textareaRef}
        />

        <EditorContent content={content} onChange={handleContentChange} textareaRef={textareaRef} />
      </div>

      <FileDetailSidebar
        content={content}
        filePath={file?.path || ''}
        isVisible={isSidebarVisible}
        onToggle={() => {
          setIsSidebarVisible(!isSidebarVisible);
        }}
      />

      {/* Rename File Dialog */}
      {file && (
        <RenameFileDialog
          open={renameDialog.isOpen}
          onOpenChange={(open) => (open ? renameDialog.openDialog() : renameDialog.closeDialog())}
          item={{
            key: file.path,
            type: 'file'
          }}
          onRename={(newName) => handleRename({ key: file.path, type: 'file' }, newName)}
          isMarkdownFile={true}
          isRenaming={isRenamingFile}
        />
      )}
    </div>
  );
}
