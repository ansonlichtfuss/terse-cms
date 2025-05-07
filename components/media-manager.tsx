"use client";
import { FileBrowser } from "@/components/file-browser/FileBrowser";
import styles from "./file-browser/FileBrowserContainer.module.css"; // Import the container styles
import { cn } from "@/lib/utils"; // Import cn utility

interface MediaManagerProps {
  onSelect: (url: string) => void;
  isMobile?: boolean;
  inSidebar?: boolean;
}

export function MediaManager({
  onSelect,
  isMobile = false,
  inSidebar = false,
}: MediaManagerProps) {
  // Create a handler function that correctly passes the URL to onSelect
  const handleSelect = (_path: string, url?: string) => {
    if (typeof onSelect === "function" && url) {
      onSelect(url);
    }
  };

  return (
    <div className={cn(styles["file-browser-container"], "h-full")}>
      <FileBrowser
        type="media"
        onSelect={handleSelect}
        isMobile={isMobile}
        inSidebar={inSidebar}
      />
    </div>
  );
}
