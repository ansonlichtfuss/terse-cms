'use client';

import matter from 'gray-matter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { GitHistorySidebar } from '@/components/git-history-sidebar';
import { MetadataDisplay } from '@/components/metadata/metadata-display';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { ScrollableContainer } from './ui/scrollable-container';

interface FileDetailSidebarProps {
  content: string;
  filePath: string;
  isVisible: boolean;
  onToggle: () => void;
}

export function FileDetailSidebar({ content, filePath, isVisible, onToggle }: FileDetailSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>('metadata');
  const [frontMatter, setFrontMatter] = useState<Record<string, string>>({});
  const [frontMatterError, setFrontMatterError] = useState<string | null>(null);

  // Parse front matter whenever content changes
  useEffect(() => {
    try {
      const { data } = matter(content || '');
      setFrontMatter(data || {});
      setFrontMatterError(null); // Clear error on successful parse
    } catch (error) {
      console.error('Error parsing front matter:', error);
      setFrontMatter({});
      setFrontMatterError('Invalid characters in frontmatter. Please check the syntax.');
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
    <div className="w-[280px] border rounded-md relative overflow-hidden">
      <Tabs
        defaultValue="metadata"
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
        }}
        className="h-full flex flex-col"
      >
        <div className="p-2 pb-0 flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-2" variant="minimal">
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <Button variant="ghost" size="sm" onClick={onToggle} className="h-7 w-7 p-0 ml-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <ScrollableContainer
          direction="vertical"
          gradientSize={64}
          dependencies={[Object.keys(frontMatter)]}
          className={cn('h-full overflow-y-auto ')}
        >
          <div className="px-4 pt-1 max-h-0">
            <TabsContent value="metadata">
              <MetadataDisplay frontMatter={frontMatter} errorMessage={frontMatterError} />
            </TabsContent>

            <TabsContent value="history">
              <GitHistorySidebar filePath={filePath} isVisible={isVisible} />
            </TabsContent>
          </div>
        </ScrollableContainer>
      </Tabs>
    </div>
  );
}
