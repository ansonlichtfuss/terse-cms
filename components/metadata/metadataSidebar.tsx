"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useFrontMatter } from "./useFrontMatter";
import { MetadataItem } from "./metadataItem";
import styles from "./metadata.module.css";

interface MetadataSidebarProps {
  content: string;
  isVisible: boolean;
  onToggle: () => void;
}

export function MetadataSidebar({
  content,
  isVisible,
  onToggle,
}: MetadataSidebarProps) {
  const frontMatter = useFrontMatter(content);

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-24 w-6 rounded-r-none rounded-l-md border-r-0 bg-gradient-secondary hover:bg-gradient-primary hover:text-white transition-all z-10"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className={`${styles.metadataSidebar} w-64 border-l relative`}>
      <div
        className={`${styles.metadataSidebarHeader} p-3 border-b flex items-center justify-between bg-gradient-secondary`}
      >
        <h3 className="text-sm font-medium">Metadata</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div
        className={`${styles.metadataSidebarContent} h-[calc(100vh-10rem)] overflow-y-auto`}
      >
        <div className="p-3">
          {Object.keys(frontMatter).length === 0 ? (
            <div className="text-xs text-muted-foreground">
              No metadata found
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(frontMatter).map(([key, value]) => (
                <MetadataItem key={key} keyName={key} value={value} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
