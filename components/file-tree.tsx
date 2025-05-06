"use client";
import { FileBrowser } from "@/components/file-browser";

// Update the interface to match the FileBrowser component's expected props
interface FileTreeProps {
  selectedFilePath?: string;
  isMobile?: boolean;
}

export function FileTree({
  selectedFilePath,
  isMobile = false,
}: FileTreeProps) {
  // Pass onFileSelect as the onSelect prop to FileBrowser
  return (
    <FileBrowser
      type="files"
      selectedPath={selectedFilePath}
      isMobile={isMobile}
      inSidebar={true}
      useUrlRouting={true}
    />
  );
}
