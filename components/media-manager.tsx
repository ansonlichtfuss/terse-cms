'use client';

import { useState } from 'react';

import { FileBrowser } from './file-browser/file-browser';

interface MediaManagerProps {
  onSelect: (url: string) => void;
  isMobile?: boolean;
  onPathChange?: (path: string, type: 'files' | 'media') => void; // Update onPathChange prop signature
  selectedPath?: string; // Add selectedPath prop
}

export function MediaManager({
  onSelect,
  isMobile = false,
  onPathChange, // Receive onPathChange prop
  selectedPath // Receive selectedPath prop
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
        onPathChange={onPathChange} // Pass onPathChange to FileBrowser
        selectedPath={selectedPath} // Pass selectedPath to FileBrowser
      />
    </div>
  );
}
