'use client';

import matter from 'gray-matter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { GitHistorySidebar } from '@/components/git-history-sidebar';
import { MetadataDisplay } from '@/components/metadata/metadata-display';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UnifiedSidebarProps {
  content: string;
  filePath: string;
  isVisible: boolean;
  onToggle: () => void;
  lastSaved?: Date | null;
}

export function UnifiedSidebar({ content, filePath, isVisible, onToggle, lastSaved }: UnifiedSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>('metadata');
  const [frontMatter, setFrontMatter] = useState<Record<string, any>>({});

  // Parse front matter whenever content changes
  useEffect(() => {
    try {
      const { data } = matter(content || '');
      setFrontMatter(data || {});
    } catch (error) {
      console.error('Error parsing front matter:', error);
      setFrontMatter({});
    }
  }, [content]);

  // Add an event listener to switch to the history tab
  useEffect(() => {
    const handleSwitchToHistoryTab = () => {
      setActiveTab('history');
    };

    window.addEventListener('switch-to-history-tab', handleSwitchToHistoryTab);

    return () => {
      window.removeEventListener('switch-to-history-tab', handleSwitchToHistoryTab);
    };
  }, []);

  // If sidebar is hidden, show the button to restore it
  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-24 w-6 rounded-r-none rounded-l-md border-r-0 bg-gradient-secondary transition-all z-10"
      >
        <ChevronLeft className="h-4 w-4" />
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
        className="h-full"
      >
        <div className="p-2 flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-2" variant="minimal">
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <Button variant="ghost" size="sm" onClick={onToggle} className="h-7 w-7 p-0 ml-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <TabsContent value="metadata" className="m-0 p-0">
            <div className="h-full overflow-y-auto">
              <div className="px-4 pt-1">
                <MetadataDisplay frontMatter={frontMatter} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="m-0 p-0">
            <div className="h-full overflow-y-auto">
              <div className="px-4 pt-1">
                <GitHistorySidebar filePath={filePath} isVisible={isVisible} onClose={onToggle} lastSaved={lastSaved} />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
