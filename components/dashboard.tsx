'use client';

import { EllipsisVertical, GitCommit, Menu, Moon, RotateCcw, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useEffect, useState } from 'react';

import { FileBrowser } from '@/components/file-browser/file-browser';
import { GitBranchDisplay } from '@/components/git/git-branch-display';
import { Logo } from '@/components/logo';
import { RepositorySwitcher } from '@/components/repository-switcher';
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
import { useGitStatus } from '@/context/git-status-context';
import { useCommitChangesMutation } from '@/hooks/api/use-commit-changes-mutation';
import { useRevertChangesMutation } from '@/hooks/api/use-revert-changes-mutation';
import { useDialogState } from '@/hooks/ui/use-dialog-state';
import { useMediaQuery } from '@/hooks/use-media-query';

// Import cn utility
import packageInfo from '../package.json';
// Import the container styles
import { GitCommitDialog } from './git/git-commit-dialog';
import { ReverseChangesDialog } from './git/reverse-changes-dialog';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-7 w-7 p-0"
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
  const commitDialog = useDialogState();
  const revertDialog = useDialogState();
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
        title: 'Failed to commit changes',
        variant: 'destructive'
      });
    }
  }, [commitError]);

  // Handle revert success and error
  useEffect(() => {
    if (revertError) {
      console.error('Failed to revert changes:', revertError);
      toast({
        title: 'Failed to revert changes',
        variant: 'destructive'
      });
    }
  }, [revertError]);

  const handleCommit = (message: string) => {
    commitChanges(message, {
      onSuccess: () => {
        commitDialog.closeDialog();
        toast({
          title: 'Changes committed'
        });
      }
    });
  };

  const handleRevert = () => {
    revertChanges(undefined, {
      onSuccess: () => {
        revertDialog.closeDialog();
        toast({
          title: 'Changes reverted'
        });
      }
    });
  };

  const renderSidebarContent = () => (
    <Tabs className="w-[280px] flex flex-col" defaultValue="files" value={selectedTab} onValueChange={setSelectedTab}>
      <TabsList className="px-3 inline-grid w-full grid-cols-2">
        <TabsTrigger value="files" className="text-sm">
          Files
        </TabsTrigger>
        <TabsTrigger value="media" className="text-sm">
          Media
        </TabsTrigger>
      </TabsList>
      <TabsContent value="files" className="flex flex-col flex-auto">
        <FileBrowser
          type="files"
          selectedPath={contentBrowserPath} // Pass content path state
          onPathChange={(path, _type) => {
            // Receive type parameter
            setContentBrowserPath(path);
          }}
        />
      </TabsContent>
      <TabsContent value="media" className="flex flex-col flex-auto">
        <FileBrowser
          type="media"
          selectedPath={mediaBrowserPath}
          isMobile={isMobile}
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
  );

  return (
    <>
      <header className="grid grid-cols-3 items-center bg-dot-pattern">
        <div className="w-[280px] flex items-center gap-2 px-3 py-2">
          <Logo size="sm" withIcon={false} />
          <span className="text-xs text-muted-foreground">v{packageInfo.version}</span>
        </div>
        <div className="flex justify-center">
          <RepositorySwitcher />
        </div>

        <div className="justify-end flex items-center gap-2 px-2 py-2">
          <ThemeToggle />
          <GitBranchDisplay />
          <Button
            variant="outline"
            size="sm"
            onClick={() => commitDialog.openDialog()}
            disabled={(modifiedFiles?.length || 0) === 0 || isCommitting}
            className="flex items-center gap-1 h-7 text-xs bg-gradient-secondary transition-all"
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
                className="px-1 h-7 transition-all"
              >
                <EllipsisVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => revertDialog.openDialog()} destructive disabled={isReverting}>
                <RotateCcw className="h-3 w-3" />
                <span className="text-xs">Revert Changes</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {isMobile ? (
        <div className="flex flex-col">
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
          <div className="flex-1">
            {children || (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                Select a file to edit
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-auto">
          {renderSidebarContent()}
          <div className="flex-auto">
            {children || (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Select a file to edit
              </div>
            )}
          </div>
        </div>
      )}

      <GitCommitDialog
        open={commitDialog.isOpen}
        onOpenChange={(open) => (open ? commitDialog.openDialog() : commitDialog.closeDialog())}
        onCommit={handleCommit}
        isCommitting={isCommitting}
      />

      {/* Revert Changes Dialog */}
      <ReverseChangesDialog
        open={revertDialog.isOpen}
        onOpenChange={(open) => (open ? revertDialog.openDialog() : revertDialog.closeDialog())}
        onRevert={handleRevert}
        isReverting={isReverting}
      />
    </>
  );
}
