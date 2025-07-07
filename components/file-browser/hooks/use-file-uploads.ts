import { useState } from 'react';

import { useToast } from '@/components/ui/use-toast';

interface FileUploadState {
  file: File;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
  uploadedUrl?: string;
  error?: string;
}

interface UseFileUploadsProps {
  uploadPath: string;
}

const useFileUploads = ({ uploadPath }: UseFileUploadsProps) => {
  const [fileUploads, setFileUploads] = useState<FileUploadState[]>([]);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    setFileUploads((prevUploads) =>
      prevUploads.map((upload) =>
        upload.file.name === file.name ? { ...upload, status: 'uploading', progress: 0 } : upload
      )
    );

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', uploadPath);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          setFileUploads((prevUploads) =>
            prevUploads.map((upload) =>
              upload.file.name === file.name ? { ...upload, progress: percentCompleted } : upload
            )
          );
        }
      });

      xhr.addEventListener('load', () => {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setFileUploads((prevUploads) =>
            prevUploads.map((upload) =>
              upload.file.name === file.name
                ? {
                    ...upload,
                    status: 'complete',
                    uploadedUrl: response.url,
                    progress: 100
                  }
                : upload
            )
          );
        } else {
          const errorMessage = response.error || 'Upload failed';
          setFileUploads((prevUploads) =>
            prevUploads.map((upload) =>
              upload.file.name === file.name ? { ...upload, status: 'error', error: errorMessage } : upload
            )
          );
          toast({
            title: `Upload Failed: ${file.name} - ${errorMessage}`,
            variant: 'destructive'
          });
        }
      });

      xhr.addEventListener('error', () => {
        const errorMessage = 'Network error';
        setFileUploads((prevUploads) =>
          prevUploads.map((upload) =>
            upload.file.name === file.name ? { ...upload, status: 'error', error: errorMessage } : upload
          )
        );
        toast({
          title: `Upload Failed: ${file.name} - ${errorMessage}`,
          variant: 'destructive'
        });
      });

      xhr.open('POST', '/api/s3/upload');
      xhr.send(formData);
    } catch {
      const errorMessage = 'An error occurred';
      setFileUploads((prevUploads) =>
        prevUploads.map((upload) =>
          upload.file.name === file.name ? { ...upload, status: 'error', error: errorMessage } : upload
        )
      );
      toast({
        title: `Upload Failed: ${file.name} - ${errorMessage}`,
        variant: 'destructive'
      });
    }
  };

  return {
    fileUploads,
    setFileUploads, // Expose setFileUploads for resetting state in UploadDialog
    uploadFile
  };
};

export { type FileUploadState, useFileUploads };
