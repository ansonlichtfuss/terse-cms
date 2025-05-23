'use client';

import { ChevronDown, GitCommit, Menu, Moon, RotateCcw, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useEffect, useState } from 'react';

import { FileBrowser } from '@/components/file-browser/FileBrowser';
import { GitBranchDisplay } from '@/components/git/GitBranchDisplay';
import { Logo } from '@/components/logo';
import { MediaManager } from '@/components/media-manager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useGitStatus } from '@/context/GitStatusContext';
import { useCommitChangesMutation } from '@/hooks/query/useCommitChangesMutation';
import { useRevertChangesMutation } from '@/hooks/query/useRevertChangesMutation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils'; // Import cn utility

import packageInfo from '../package.json';
import containerStyles from './file-browser/FileBrowserContainer.module.css'; // Import the container styles
import { GitCommitDialog } from './gitDialogs/GitCommitDialog';
import { ReverseChangesDialog } from './gitDialogs/ReverseChangesDialog';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-7 w-7 p-0 mr-2"
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function Dashboard({ selectedFilePath, children }: { selectedFilePath?: string; children?: React.ReactNode }) {
  const [selectedTab, setSelectedTab] = useState('files');
  const [contentBrowserPath, setContentBrowserPath] = useState(selectedFilePath); // State for content file browser path
  const [mediaBrowserPath, setMediaBrowserPath] = useState(''); // State for media file browser path
  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false);
  const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Use the context to get modified files
  const { modifiedFiles } = useGitStatus();

  // Use the new Tanstack Query mutation hooks
  const { mutate: commitChanges, isPending: isCommitting, error: commitError } = useCommitChangesMutation();
  const { mutate: revertChanges, isPending: isReverting, error: revertError } = useRevertChangesMutation();

  // Handle commit success and error
  useEffect(() => {
    if (commitError) {
      console.error('Failed to commit changes:', commitError);
      toast({
        title: 'Error',
        description: 'Failed to commit changes',
        variant: 'destructive'
      });
    }
  }, [commitError]);

  // Handle revert success and error
  useEffect(() => {
    if (revertError) {
      console.error('Failed to revert changes:', revertError);
      toast({
        title: 'Error',
        description: 'Failed to revert changes',
        variant: 'destructive'
      });
    }
  }, [revertError]);

  const handleCommit = (message: string) => {
    commitChanges(message, {
      onSuccess: () => {
        setIsCommitDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Changes committed successfully'
        });
      }
    });
  };

  const handleRevert = () => {
    revertChanges(undefined, {
      onSuccess: () => {
        setIsRevertDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Changes reverted successfully'
        });
      }
    });
  };

  const renderSidebarContent = () => (
    <div className={containerStyles['file-browser-container']}>
      <Tabs defaultValue="files" value={selectedTab} onValueChange={setSelectedTab}>
        <div className="m-2">
          <TabsList className="inline-grid w-full grid-cols-2">
            <TabsTrigger value="files" className="text-sm">
              Files
            </TabsTrigger>
            <TabsTrigger value="media" className="text-sm">
              Media
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="files">
          <FileBrowser
            selectedPath={contentBrowserPath} // Pass content path state
            onPathChange={(path, _type) => {
              // Receive type parameter
              setContentBrowserPath(path);
            }}
            type="files"
          />
        </TabsContent>
        <TabsContent value="media">
          <MediaManager
            selectedPath={mediaBrowserPath} // Pass media path state
            onPathChange={(path, type) => {
              // Receive type parameter
              // Ensure media paths have a trailing slash for folders (except root)
              const formattedPath = path && type === 'media' && !path.endsWith('/') ? `${path}/` : path;
              setMediaBrowserPath(formattedPath);
            }}
            onSelect={(_url) => {
              // if (selectedFile) {
              // Logic to insert media URL into editor or YAML front matter
              // }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b flex items-center justify-between bg-dot-pattern">
        <div className="flex items-center gap-2 px-3 py-2">
          <Logo size="sm" withIcon={false} />
          <span className="text-xs text-muted-foreground">v{packageInfo.version}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2">
          <ThemeToggle />
          <GitBranchDisplay />
          <div className="flex">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCommitDialogOpen(true)}
              disabled={(modifiedFiles?.length || 0) === 0 || isCommitting}
              className="flex items-center rounded-r-none  gap-1 h-7 text-xs bg-gradient-secondary transition-all"
            >
              <GitCommit className="h-3 w-3 mr-1" />
              Commit
              {(modifiedFiles?.length || 0) > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 text-[10px] bg-background pointer-events-none">
                  {modifiedFiles?.length || 0}
                </Badge>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(modifiedFiles?.length || 0) === 0}
                  className="px-1 border-l-1 border-l-gray-5`0 rounded-l-none h-7 bg-gradient-secondary transition-all"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setIsRevertDialogOpen(true)}
                  className="dropdown-menu-item-destructive"
                  disabled={isReverting}
                >
                  <RotateCcw className="h-3 w-3 mr-2" />
                  <span className="text-xs">Revert Changes</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {isMobile ? (
        <div className="flex flex-col h-full">
          <div className="p-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="mb-2 h-7 text-xs">
                  <Menu className="h-3 w-3 mr-1" />
                  {selectedTab === 'files' ? 'Files' : 'Media'}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex-1 overflow-auto">
            {children || (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                Select a file to edit
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-full">
          <div className={cn(containerStyles['file-browser-container'], 'w-[280px] border-r max-h-full')}>
            {renderSidebarContent()}
          </div>
          <div className="flex-1 overflow-auto">
            {children || (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Select a file to edit
              </div>
            )}
          </div>
        </div>
      )}

      <GitCommitDialog
        open={isCommitDialogOpen}
        onOpenChange={setIsCommitDialogOpen}
        onCommit={handleCommit}
        isCommitting={isCommitting}
      />

      {/* Revert Changes Dialog */}
      <ReverseChangesDialog
        open={isRevertDialogOpen}
        onOpenChange={setIsRevertDialogOpen}
        onRevert={handleRevert}
        isReverting={isReverting}
      />
    </div>
  );
}
