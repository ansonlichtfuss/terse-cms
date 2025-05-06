import type React from "react";
import { RefreshCw, FolderPlus, Upload, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FileBrowserActionsProps {
  type: "files" | "media";
  inSidebar: boolean;
  viewMode: "grid" | "list";
  isUploading: boolean;
  onRefresh: () => void;
  onNewFolderClick: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onViewModeToggle: () => void;
}

export function FileBrowserActions({
  type,
  inSidebar,
  viewMode,
  isUploading,
  onRefresh,
  onNewFolderClick,
  onUpload,
  onViewModeToggle,
}: FileBrowserActionsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className={`flex ${inSidebar ? "gap-1" : "gap-2"} justify-center`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={inSidebar ? "icon" : "sm"}
              onClick={onRefresh}
              className="flex-shrink-0 h-7 w-7"
            >
              <RefreshCw className={inSidebar ? "h-3 w-3" : "h-3 w-3 mr-1"} />
              {!inSidebar && "Refresh"}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Refresh</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={inSidebar ? "icon" : "sm"}
              onClick={onNewFolderClick}
              className="flex-shrink-0 h-7 w-7"
            >
              <FolderPlus className={inSidebar ? "h-3 w-3" : "h-3 w-3 mr-1"} />
              {!inSidebar && "New Folder"}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>New Folder</p>
          </TooltipContent>
        </Tooltip>

        {type === "media" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative flex-shrink-0">
                <Input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={onUpload}
                  disabled={isUploading}
                />
                <Button
                  variant="outline"
                  size={inSidebar ? "icon" : "sm"}
                  disabled={isUploading}
                  className="h-7 w-7"
                >
                  <Upload className={inSidebar ? "h-3 w-3" : "h-3 w-3 mr-1"} />
                  {!inSidebar && "Upload"}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Upload File</p>
            </TooltipContent>
          </Tooltip>
        )}

        {type === "media" && ( // Assuming view mode toggle is only for media for now based on original code
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={inSidebar ? "icon" : "sm"} // Adjust size for sidebar if needed
                onClick={onViewModeToggle}
                className="flex-shrink-0 h-7 w-7" // Adjust size for sidebar if needed
              >
                {viewMode === "grid" ? (
                  <>
                    <List className={inSidebar ? "h-3 w-3" : "h-3 w-3 mr-1"} />
                    {!inSidebar && "List View"}
                  </>
                ) : (
                  <>
                    <LayoutGrid
                      className={inSidebar ? "h-3 w-3" : "h-3 w-3 mr-1"}
                    />
                    {!inSidebar && "Grid View"}
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Change View</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
