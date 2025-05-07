"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import matter from "gray-matter";
import { MetadataDisplay } from "@/components/metadata-display";
import { HistoryDisplay } from "@/components/history-display";

interface UnifiedSidebarProps {
  content: string;
  filePath: string;
  isVisible: boolean;
  onToggle: () => void;
  lastSaved?: Date | null;
}

export function UnifiedSidebar({
  content,
  filePath,
  isVisible,
  onToggle,
  lastSaved,
}: UnifiedSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("metadata");
  const [frontMatter, setFrontMatter] = useState<Record<string, any>>({});

  // Parse front matter whenever content changes
  useEffect(() => {
    try {
      const { data } = matter(content || "");
      setFrontMatter(data || {});
    } catch (error) {
      console.error("Error parsing front matter:", error);
      setFrontMatter({});
    }
  }, [content]);

  // Add an event listener to switch to the history tab
  useEffect(() => {
    const handleSwitchToHistoryTab = () => {
      setActiveTab("history");
    };

    window.addEventListener("switch-to-history-tab", handleSwitchToHistoryTab);

    return () => {
      window.removeEventListener(
        "switch-to-history-tab",
        handleSwitchToHistoryTab
      );
    };
  }, []);

  // If sidebar is hidden, show the button to restore it
  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-24 w-6 rounded-r-none rounded-l-md border-r-0 bg-gradient-secondary hover:bg-gradient-primary hover:text-white transition-all z-10"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="w-64 border-l relative unified-sidebar">
      <Tabs
        defaultValue="metadata"
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
        }}
        className="tabs-container h-full minimal-tabs"
      >
        <div className="p-2 flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metadata" className="text-xs">
              Metadata
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              History
            </TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-7 w-7 p-0 ml-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="tabs-content">
          <TabsContent value="metadata" className="tab-panel m-0 p-0">
            <div className="h-full overflow-y-auto">
              <div className="px-2 pt-1">
                <MetadataDisplay frontMatter={frontMatter} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="tab-panel m-0 p-0">
            <div className="h-full overflow-y-auto">
              <div className="px-2 pt-1">
                <HistoryDisplay filePath={filePath} lastSaved={lastSaved} />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
