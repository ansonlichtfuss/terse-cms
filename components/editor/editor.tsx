'use client';

import matter from 'gray-matter';
import { Clock, Edit2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { EditorContent, handleToolbarAction } from '@/components/editor/editor-content';
import { EditorToolbar } from '@/components/editor/editor-toolbar';
import { MediaDialog } from '@/components/media-dialog';
import { RenameFileDialog } from '@/components/rename-file-dialog';
import { UnifiedSidebar } from '@/components/unified-sidebar';
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
  const [fileTitle, setFileTitle] = useState('');
  const mediaDialog = useDialogState();
  const renameDialog = useDialogState();

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

  // Add this effect to parse the front matter and extract the title
  useEffect(() => {
    if (file && file.content) {
      try {
        const { data } = matter(file.content || '');
        setFileTitle(data.title || '');
      } catch (error) {
        console.error('Error parsing front matter:', error);
        setFileTitle('');
      }
    }
  }, [file]);

  // Handle content changes from user input
  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    // Only auto-save if we're past the initial load
    if (!initialLoadRef.current && file) {
      debouncedSave(file.path, newContent);
    }
  };

  // Handle media selection
  const handleMediaSelect = (url: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    // Insert markdown image syntax at cursor position
    const imageMarkdown = `![Alt text](${url})`;
    const newContent = content.substring(0, startPos) + imageMarkdown + content.substring(endPos);

    setContent(newContent);

    // Update cursor position to after the inserted image
    const newCursorPos = startPos + imageMarkdown.length;

    // Set the new cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    // Auto-save the updated content
    if (!initialLoadRef.current && file) {
      debouncedSave(file.path, newContent);
    }

    mediaDialog.closeDialog();
  };

  // Handle toolbar actions
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

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Clean up the debounced function on unmount
  useEffect(() => {
    return () => {
      // use-debounce does not require explicit cancel on unmount
    };
  }, []);

  // Use the git status context
  const { updateGitStatus } = useGitStatus();

  // Use the file operations hook
  const { handleRename, isRenamingFile } = useFileOperations({
    type: 'files', // Assuming editor only deals with 'files' type
    currentPath: file?.path || '', // Pass the current file path

    setIsDeleteDialogOpen: () => {}, // Dummy function
    setItemToAction: () => {} // Dummy function
  });

  // Safely get the filename from the path
  const getFileName = () => {
    if (!file || !file.path) return 'Untitled';
    const pathParts = file.path.split('/');
    return pathParts[pathParts.length - 1] || 'Untitled';
  };

  return (
    <div className="h-full flex">
      {/* Editor */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="border-b p-2 flex items-center justify-between bg-gradient-secondary">
          <div className="flex-1 truncate">
            <h2
              className="text-sm font-semibold truncate flex items-center cursor-pointer hover:text-primary"
              onClick={() => renameDialog.openDialog()}
            >
              {getFileName()} <Edit2 className="h-3 w-3 ml-1 opacity-50" />
            </h2>
            {fileTitle && <p className="text-xs text-muted-foreground truncate">{fileTitle}</p>}
          </div>
          {/* File modification timestamp */}
          <span className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {fileModificationTime ? formatModificationTime(fileModificationTime) : 'No modification time'}
          </span>
        </div>

        {/* Editor Toolbar */}
        <div className="px-2 pt-2">
          <EditorToolbar
            onAction={handleToolbarActionClick}
            onImageClick={() => mediaDialog.openDialog()}
            textareaRef={textareaRef}
          />
        </div>

        {/* Markdown Editor */}
        <div className="flex-1 p-2 m-0">
          <EditorContent content={content} onChange={handleContentChange} textareaRef={textareaRef} />
        </div>
      </div>

      {/* Unified Sidebar - now with tabs for metadata and history */}
      <UnifiedSidebar
        content={content}
        filePath={file?.path || ''}
        isVisible={isSidebarVisible}
        onToggle={toggleSidebar}
      />

      {/* Media Dialog for Image Selection */}
      <MediaDialog
        open={mediaDialog.isOpen}
        onOpenChange={(open) => (open ? mediaDialog.openDialog() : mediaDialog.closeDialog())}
        onSelect={handleMediaSelect}
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
