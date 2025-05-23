import React, { useEffect } from 'react'; // Import useEffect

// Import Breadcrumbs
import { Button } from '@/components/ui/button'; // Import Button
import {
  Dialog,
  DialogContent,
  DialogFooter, // Import DialogFooter
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import { PathBreadcrumbs } from '../breadcrumbs/Breadcrumbs';
import { FileUploadItem } from './FileUploadItem'; // Import FileUploadItem component
import { useDragAndDrop } from './useDragAndDrop'; // Import useDragAndDrop hook
import { useFileUploads } from './useFileUploads'; // Import useFileUploads hook
import { type FileUploadState } from './useFileUploads'; // Import FileUploadState type

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  uploadPath: string; // Add the new uploadPath prop
}

const UploadDialog: React.FC<UploadDialogProps> = ({ isOpen, onClose, uploadPath }) => {
  const { fileUploads, setFileUploads, uploadFile } = useFileUploads({
    uploadPath
  }); // Use the useFileUploads hook
  const { isDraggingOver, handleDrop, handleDragOver, handleDragLeave, handleFileSelect } = useDragAndDrop({
    onFilesSelected: (files) => {
      if (files) {
        const newFiles = Array.from(files).map((file) => ({
          file,
          status: 'pending' as const, // Explicitly cast status
          progress: 0
        })) as FileUploadState[]; // Explicitly cast the array
        setFileUploads((prevUploads) => [...prevUploads, ...newFiles]);
        newFiles.forEach((upload) => {
          uploadFile(upload.file);
        });
      }
    }
  }); // Use the useDragAndDrop hook

  // Effect to reset state when the dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setFileUploads([]);
    }
  }, [isOpen, setFileUploads]); // Depend on isOpen and setFileUploads

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <PathBreadcrumbs currentPath={uploadPath} onNavigate={() => {}} isClickable={false} />
        </DialogHeader>
        <div
          className={`border-1 border-dashed rounded-md p-6 text-center cursor-pointer mb-4 text-gray-500 hover:text-gray-800 ${
            // Added mb-4 for spacing
            isDraggingOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300' // Conditional styling
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave} // Add drag leave handler
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input
            id="fileInput"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            // Clear the input value after selection to allow selecting the same file again
            onClick={(event) => {
              const element = event.target as HTMLInputElement;
              element.value = '';
            }}
          />
          <p className="text-sm">Drag and drop files here, or click to select files</p>
        </div>
        {/* Combined Upload Grid */}
        {fileUploads.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Uploads</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {' '}
              {/* Responsive grid */}
              {fileUploads.map((upload, index) => (
                <FileUploadItem key={index} upload={upload} /> // Use FileUploadItem component
              ))}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
