import type React from "react";
import Link from "next/link";
import { File, Folder, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getItemName, getItemPath } from "./utils"; // Import utility functions
import type { FileItem } from "../file-browser"; // Assuming FileItem type remains in the main file for now

interface FileItemRowProps {
  item: FileItem;
  isSelected: boolean;
  type: "files" | "media";
  useUrlRouting: boolean;
  onItemClick: (item: FileItem) => void;
  onDeleteClick: (item: FileItem) => void;
  onRenameClick: (item: FileItem) => void; // Add rename handler
  onMoveClick: (item: FileItem) => void; // Add move handler
}

export function FileItemRow({
  item,
  isSelected,
  type,
  useUrlRouting,
  onItemClick,
  onDeleteClick,
  onRenameClick, // Destructure new handlers
  onMoveClick, // Destructure new handlers
}: FileItemRowProps) {
  const itemPath = getItemPath(item);
  const itemName = getItemName(item);
  const isFolder = item.type === "folder" || item.type === "directory";
  const isMarkdownFile = type === "files" && !isFolder;

  // Render Link for files when using URL routing
  if (!isFolder && type === "files" && useUrlRouting) {
    return (
      <Link
        key={itemPath}
        href={`/edit/${itemPath}`}
        className={cn(
          "flex items-center justify-between py-1 px-1 rounded-md w-full",
          isSelected ? "bg-muted" : "hover:bg-muted"
        )}
        // onClick={(e) => {
        //   // Still call onItemClick to update the selected item state in the parent
        //   e.preventDefault();
        //   onItemClick(item);
        //   // Let the Link component handle the navigation
        //   // Returning true here allows the default link behavior
        //   // If you want to prevent default navigation and handle it manually, return false or remove this line
        //   return true;
        // }}
      >
        <div className="flex items-center min-w-0 overflow-hidden flex-1 pr-1 max-w-[200px]">
          <File className="h-4 w-4 text-muted-foreground mr-1 flex-shrink-0" />
          <span className="text-xs truncate block w-full" title={itemName}>
            {itemName}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation(); // Prevent item click when clicking the button
                e.preventDefault(); // Prevent default link behavior if inside Link
              }}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onMoveClick(item)}>
              Move
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRenameClick(item)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteClick(item)}
              className="dropdown-menu-item-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Link>
    );
  }

  // Render div for folders or when not using URL routing
  return (
    <div
      key={itemPath}
      className={cn(
        "flex items-center justify-between py-1 px-1 rounded-md cursor-pointer hover:bg-muted w-full",
        isSelected && "bg-muted"
      )}
      onClick={() => onItemClick(item)}
    >
      <div className="flex items-center min-w-0 overflow-hidden flex-1 pr-1 max-w-[200px]">
        {isFolder ? (
          <Folder className="h-4 w-4 text-muted-foreground mr-1 flex-shrink-0" />
        ) : type === "media" &&
          item.url &&
          item.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
          <div className="h-6 w-6 mr-1 flex-shrink-0">
            <img
              src={item.url || "/placeholder.svg"}
              alt={itemName}
              className="h-full w-full object-cover rounded-md"
            />
          </div>
        ) : (
          type === "media" && (
            <File className="h-4 w-4 text-muted-foreground mr-1 flex-shrink-0" />
          )
        )}
        <span className="text-xs truncate block w-full" title={itemName}>
          {itemName}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation(); // Prevent item click when clicking the button
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onMoveClick(item)}>
            Move
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRenameClick(item)}>
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDeleteClick(item)}
            className="dropdown-menu-item-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
