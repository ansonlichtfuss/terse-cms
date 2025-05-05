"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Editor } from "@/components/editor"
import { FileTree } from "@/components/file-tree"
import { MediaManager } from "@/components/media-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Save, ChevronDown, RotateCcw, Moon, Sun } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GitCommitDialog } from "@/components/git-commit-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Logo } from "@/components/logo"
import { useTheme } from "next-themes"
import packageInfo from "../package.json"

export interface FileData {
  path: string
  content: string
  isModified: boolean
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-7 w-7 p-0 mr-2"
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null)
  const [selectedTab, setSelectedTab] = useState("files")
  const [modifiedFiles, setModifiedFiles] = useState<string[]>([])
  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false)
  const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    // Load modified files count from localStorage or API
    const fetchModifiedFiles = async () => {
      try {
        const response = await fetch("/api/git/status")
        const data = await response.json()
        setModifiedFiles(data.modifiedFiles || [])
      } catch (error) {
        console.error("Failed to fetch git status:", error)
        setModifiedFiles([]) // Ensure modifiedFiles is always an array
      }
    }

    fetchModifiedFiles()
  }, [])

  const handleFileSelect = async (path: string) => {
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`)
      const data = await response.json()
      setSelectedFile({
        path,
        content: data.content,
        isModified: modifiedFiles.includes(path),
      })
    } catch (error) {
      console.error("Failed to fetch file:", error)
    }
  }

  const handleFileSave = async (path: string, content: string) => {
    try {
      await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path, content }),
      })

      // Update modified files
      if (!modifiedFiles.includes(path)) {
        setModifiedFiles([...modifiedFiles, path])
      }

      // Update selected file
      if (selectedFile && selectedFile.path === path) {
        setSelectedFile({
          ...selectedFile,
          content,
          isModified: true,
        })
      }
    } catch (error) {
      console.error("Failed to save file:", error)
    }
  }

  const handleCommit = async () => {
    setIsCommitDialogOpen(true)
  }

  const commitChanges = async (message: string) => {
    try {
      await fetch("/api/git/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      // Clear modified files after successful commit
      setModifiedFiles([])

      // Update selected file if it was modified
      if (selectedFile && selectedFile.isModified) {
        setSelectedFile({
          ...selectedFile,
          isModified: false,
        })
      }

      setIsCommitDialogOpen(false)

      toast({
        title: "Success",
        description: "Changes committed successfully",
      })
    } catch (error) {
      console.error("Failed to commit changes:", error)
      toast({
        title: "Error",
        description: "Failed to commit changes",
        variant: "destructive",
      })
    }
  }

  const handleRevertChanges = async () => {
    try {
      const response = await fetch("/api/git/revert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to revert changes")
      }

      // Clear modified files
      setModifiedFiles([])

      // Update selected file if it was modified
      if (selectedFile && selectedFile.isModified) {
        // Reload the file content
        const fileResponse = await fetch(`/api/files?path=${encodeURIComponent(selectedFile.path)}`)
        const fileData = await fileResponse.json()

        setSelectedFile({
          ...selectedFile,
          content: fileData.content,
          isModified: false,
        })
      }

      setIsRevertDialogOpen(false)

      toast({
        title: "Success",
        description: "Changes reverted successfully",
      })
    } catch (error) {
      console.error("Failed to revert changes:", error)
      toast({
        title: "Error",
        description: "Failed to revert changes",
        variant: "destructive",
      })
    }
  }

  const renderSidebarContent = () => (
    <div className="tabs-container">
      <Tabs
        defaultValue="files"
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full minimal-tabs compact-tabs"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files" className="text-xs">
            Files
          </TabsTrigger>
          <TabsTrigger value="media" className="text-xs">
            Media
          </TabsTrigger>
        </TabsList>
        <div className="tabs-content">
          <TabsContent value="files" className="tab-panel mt-2">
            <FileTree onFileSelect={handleFileSelect} />
          </TabsContent>
          <TabsContent value="media" className="tab-panel mt-2">
            <MediaManager
              onSelect={(url) => {
                if (selectedFile) {
                  // Logic to insert media URL into editor or YAML front matter
                }
              }}
              inSidebar={true}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b flex items-center justify-between bg-dot-pattern">
        <div className="flex items-center gap-2 px-3 py-2">
          <Logo size="sm" withIcon={false} />
          <span className="text-xs text-muted-foreground">v{packageInfo.version}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2">
          <ThemeToggle />
          <div className="flex">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCommit}
              disabled={modifiedFiles.length === 0}
              className="flex items-center gap-1 rounded-r-none border-r-0 h-7 text-xs bg-gradient-secondary hover:bg-gradient-primary hover:text-white transition-all"
            >
              <Save className="h-3 w-3 mr-1" />
              Commit
              {modifiedFiles.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 text-[10px]">
                  {modifiedFiles.length}
                </Badge>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={modifiedFiles.length === 0}
                  className="px-1 rounded-l-none h-7 bg-gradient-secondary hover:bg-gradient-primary hover:text-white transition-all"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setIsRevertDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
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
                  {selectedTab === "files" ? "Files" : "Media"}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px] p-2">
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex-1 overflow-auto">
            {selectedFile ? (
              <Editor file={selectedFile} onSave={handleFileSave} />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                Select a file to edit
              </div>
            )}
          </div>
        </div>
      ) : (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <Sidebar>{renderSidebarContent()}</Sidebar>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={80}>
            {selectedFile ? (
              <Editor file={selectedFile} onSave={handleFileSave} />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                Select a file to edit
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      <GitCommitDialog
        open={isCommitDialogOpen}
        onOpenChange={setIsCommitDialogOpen}
        onCommit={commitChanges}
        modifiedFiles={modifiedFiles}
      />

      {/* Revert Changes Confirmation Dialog */}
      <ConfirmationDialog
        open={isRevertDialogOpen}
        onOpenChange={setIsRevertDialogOpen}
        title="Revert Changes"
        description="Are you sure you want to revert all changes? This action cannot be undone."
        confirmLabel="Revert"
        onConfirm={handleRevertChanges}
        destructive={true}
        itemsList={modifiedFiles}
      />
    </div>
  )
}
