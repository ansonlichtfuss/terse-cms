import type React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { FileItem } from "./FileBrowser";

interface FileItemDropdownProps {
  item: FileItem;
  onMoveClick: (item: FileItem) => void;
  onRenameClick: (item: FileItem) => void;
  onDeleteClick: (item: FileItem) => void;
}

export function FileItemDropdown({
  item,
  onMoveClick,
  onRenameClick,
  onDeleteClick,
}: FileItemDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={(e) => {
            e.stopPropagation(); // Prevent item click when clicking the button
            e.preventDefault(); // Prevent default link behavior if inside Link
          }}
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            onMoveClick(item);
          }}
        >
          Move
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            onRenameClick(item);
          }}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            onDeleteClick(item);
          }}
          className="dropdown-menu-item-destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
