import type React from "react";
import {
  RefreshCw,
  FolderPlus,
  Upload,
  LayoutGrid,
  List,
  FilePlus,
} from "lucide-react"; // Added FilePlus icon
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation"; // Import useRouter
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FileBrowserActionsProps {
  type: "files" | "media";
  isUploading: boolean;
  onRefresh: () => void;
  onNewFolderClick: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentPath: string; // Add currentPath prop
}

export function FileBrowserActions({
  type,
  isUploading,
  onRefresh,
  onNewFolderClick,
  onUpload,
  currentPath, // Destructure currentPath
}: FileBrowserActionsProps) {
  const router = useRouter(); // Initialize useRouter

  const handleNewFileClick = () => {
    const newFilePath = `/edit/${
      currentPath ? `${currentPath}/` : ""
    }untitled.md`;
    router.push(newFilePath);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "relative",
          "mb-2 mx-3",
          "p-1 border rounded-md bg-gradient-secondary"
        )}
      >
        <div className={cn("flex", "gap-1", "justify-center")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                className="shrink-0 h-7 w-7"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Refresh</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewFolderClick}
                className="shrink-0 h-7 w-7"
              >
                <FolderPlus className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>New Folder</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className=" absolute right-1 top-1">
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
                    size="icon"
                    disabled={isUploading}
                    className="h-7 w-7"
                  >
                    <Upload className="h-3 w-3" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Upload File</p>
              </TooltipContent>
            </Tooltip>
          )}

          {type === "files" && ( // Only show for file browser
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Use a Button component for action */}
                <Button
                  variant="outline" // Use ghost variant for styling
                  size="icon" // Use icon size
                  onClick={handleNewFileClick} // Call the handler
                  className="shrink-0 h-7 w-7" // Ensure correct size
                >
                  <FilePlus className="h-3 w-3" /> {/* Use FilePlus icon */}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>New File</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
