"use client";

import { useState } from "react";

import { FileBrowser } from "./file-browser/FileBrowser";

interface MediaManagerProps {
  onSelect: (url: string) => void;
  isMobile?: boolean;
}

export function MediaManager({
  onSelect,
  isMobile = false,
}: MediaManagerProps) {
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);

  return (
    <div className="h-full">
      <FileBrowser
        type="media"
        onSelect={(path, url) => {
          setSelectedMediaUrl(url || path);
          onSelect(url || path);
        }}
        isMobile={isMobile}
      />
    </div>
  );
}
