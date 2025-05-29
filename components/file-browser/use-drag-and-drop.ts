import { useState } from 'react';

// Import FileUploadState type

interface UseDragAndDropProps {
  onFilesSelected: (files: FileList | null) => void;
}

const useDragAndDrop = ({ onFilesSelected }: UseDragAndDropProps) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    onFilesSelected(files);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
    // Indicate that dropping is allowed
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
  };

  return {
    isDraggingOver,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileSelect
  };
};

export { useDragAndDrop };
