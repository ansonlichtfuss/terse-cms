'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Dashboard } from '@/components/dashboard';
import { Editor } from '@/components/editor/editor';
import { useFileContentQuery } from '@/hooks/api/use-file-content-query';
import { useSaveFileMutation } from '@/hooks/api/use-save-file-mutation';

export default function EditPage() {
  const params = useParams();
  const router = useRouter();

  // Extract the file path from the URL parameters
  const filePath = Array.isArray(params.path) ? params.path.join('/') : params.path || '';

  // Use the Tanstack Query hook to fetch file content
  const { data: file, isLoading, error: fetchError } = useFileContentQuery(filePath);

  // Use the Tanstack Query mutation hook to save file content
  const { mutate: saveFile, isPending: _isSaving, error: saveError } = useSaveFileMutation();

  // Handle fetch error
  useEffect(() => {
    if (fetchError) {
      console.error('Failed to fetch file:', fetchError);
    }
  }, [fetchError, router]);

  // Handle save error
  useEffect(() => {
    if (saveError) {
      console.error('Failed to save file:', saveError);
      // Optionally show a toast or handle the error in the UI
    }
  }, [saveError]);

  return (
    <Dashboard
      selectedFilePath={filePath} // Pass selectedFilePath
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Loading file...</div>
      ) : fetchError ? (
        <div className="flex items-center justify-center h-full text-xs text-destructive">
          Error loading file: {fetchError.message}
        </div>
      ) : file ? (
        <Editor file={file} onSave={(path, content) => saveFile({ path, content })} />
      ) : (
        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
          Select a file to edit
        </div>
      )}
    </Dashboard>
  );
}
