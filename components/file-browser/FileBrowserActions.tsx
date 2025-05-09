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
import { cn } from "@/lib/utils";

interface FileBrowserActionsProps {
  type: "files" | "media";
  inSidebar: boolean;
  isUploading: boolean;
  onRefresh: () => void;
  onNewFolderClick: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileBrowserActions({
  type,
  inSidebar,
  isUploading,
  onRefresh,
  onNewFolderClick,
  onUpload,
}: FileBrowserActionsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn("flex", inSidebar ? "gap-1" : "gap-2", "justify-center")}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={inSidebar ? "icon" : "sm"}
              onClick={onRefresh}
              className="shrink-0 h-7 w-7"
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
              className="shrink-0 h-7 w-7"
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
              <div className="relative shrink-0">
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
      </div>
    </TooltipProvider>
  );
}
