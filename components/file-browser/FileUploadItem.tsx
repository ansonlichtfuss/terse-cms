import React from "react";

import { type FileUploadState } from "./useFileUploads"; // Import FileUploadState type

interface FileUploadItemProps {
  upload: FileUploadState;
}

const FileUploadItem: React.FC<FileUploadItemProps> = ({ upload }) => {
  return (
    <div
      className={`border rounded-md p-3 flex flex-col items-center text-center relative overflow-hidden ${
        // Added overflow-hidden
        upload.status === "error" ? "border-red-500" : "" // Highlight in red on error
      }`}
    >
      {/* Progress bar on top */}
      {upload.status === "uploading" && (
        <div className="absolute top-0 left-0 w-full bg-gray-200 rounded-t-md h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-t-md"
            style={{ width: `${upload.progress}%` }}
          ></div>
        </div>
      )}
      {/* Error message on top */}
      {upload.status === "error" && upload.error && (
        <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-xs text-center py-1 rounded-t-md z-10">
          {" "}
          {/* Added z-10 */}
          Error
        </div>
      )}
      {upload.status === "complete" &&
      upload.uploadedUrl &&
      upload.file.type.startsWith("image/") ? (
        // Display thumbnail for completed image uploads
        // TODO: Use a proper Image component and potentially optimize/resize thumbnails
        <img
          src={upload.uploadedUrl}
          alt={upload.file.name}
          className="w-full h-20 object-cover rounded-md mb-2"
        />
      ) : (
        // Placeholder or icon for other file types or during upload
        <div className="w-full h-20 flex items-center justify-center bg-gray-200 rounded-md mb-2">
          {/* TODO: Add file type icons */}
          <span>{upload.file.name.substring(0, 5)}...</span>{" "}
          {/* Show truncated name */}
        </div>
      )}
      <p className="text-sm font-medium truncate w-full mb-1">
        {upload.file.name}
      </p>{" "}
      {/* Truncate long names */}
      {upload.status === "pending" && (
        <p className="text-xs text-gray-500">Pending...</p>
      )}
      {/* Removed "Complete!" message */}
      {upload.status === "error" && (
        <p className="text-xs text-red-600">{upload.error}</p> // Display full error message below
      )}
    </div>
  );
};

export { FileUploadItem };
