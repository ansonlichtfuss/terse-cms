import React from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface ConfigErrorDialogProps {
  error: string;
}

export function ConfigErrorDialog({ error }: ConfigErrorDialogProps) {
  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Configuration Error
          </AlertDialogTitle>
          <AlertDialogDescription>{error}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTitle>How to fix this:</AlertTitle>
            <AlertDescription>
              Configure repositories using environment variables:
              <div className="mt-3 p-3 bg-muted rounded text-sm font-mono">
                <div>MARKDOWN_ROOT_DIR_1=/path/to/first/repository</div>
                <div>MARKDOWN_ROOT_LABEL_1=Main Documentation</div>
                <div className="mt-2">MARKDOWN_ROOT_DIR_2=/path/to/second/repository</div>
                <div>MARKDOWN_ROOT_LABEL_2=API Documentation</div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTitle>Development Mode</AlertTitle>
            <AlertDescription>
              For development, you can use mock data by setting:
              <div className="mt-2 p-2 bg-muted rounded text-sm font-mono">USE_MOCK_API=true</div>
            </AlertDescription>
          </Alert>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
