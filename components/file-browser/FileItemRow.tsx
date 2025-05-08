import type React from "react";
import Link from "next/link";
import { File, Folder } from "lucide-react";
import styles from "./FileItemRow.module.css";
import { cn } from "@/lib/utils";
import { getItemName, getItemPath } from "./utils"; // Import utility functions
import type { FileItem } from "./FileBrowser"; // Assuming FileItem type remains in the main file for now
import { FileItemDropdown } from "./FileItemDropdown";

interface FileItemRowProps {
  item: FileItem;
  isSelected: boolean;
  type: "files" | "media";
  onItemClick: (item: FileItem) => void;
  onDeleteClick: (item: FileItem) => void;
  onRenameClick: (item: FileItem) => void; // Add rename handler
  onMoveClick: (item: FileItem) => void; // Add move handler
}

export function FileItemRow({
  item,
  isSelected,
  type,
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
  if (!isFolder && type === "files") {
    return (
      <Link
        key={itemPath}
        href={`/edit/${itemPath}`}
        className={cn(
          styles["file-row"],
          "flex items-center justify-between py-1 px-1 rounded-md w-full",
          isSelected ? styles.selected : styles["file-row:hover"]
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
        <div
          className={cn(
            styles["file-item"],
            "flex items-center min-w-0 overflow-hidden flex-1 pr-1 max-w-[200px]",
            (itemName.toLowerCase().endsWith(".md") ||
              itemName.toLowerCase().endsWith(".txt")) &&
              "pl-2"
          )}
        >
          {!itemName.toLowerCase().endsWith(".md") &&
            !itemName.toLowerCase().endsWith(".txt") && (
              <File
                className={cn(
                  styles["file-item-icon"],
                  "h-4 w-4 text-muted-foreground mr-1 flex-shrink-0"
                )}
              />
            )}
          <span
            className={cn(
              styles["file-item-name"],
              "text-xs truncate block w-full"
            )}
            title={itemName}
          >
            {itemName}
          </span>
        </div>

        <FileItemDropdown
          item={item}
          onMoveClick={onMoveClick}
          onRenameClick={onRenameClick}
          onDeleteClick={onDeleteClick}
        />
      </Link>
    );
  }

  // Render div for folders or when not using URL routing
  return (
    <div
      key={itemPath}
      className={cn(
        styles["file-row"],
        "flex items-center justify-between py-1 px-1 rounded-md cursor-pointer w-full",
        isSelected ? styles.selected : styles["file-row:hover"]
      )}
      onClick={() => onItemClick(item)}
    >
      <div
        className={cn(
          styles["folder-item"],
          "flex items-center min-w-0 overflow-hidden flex-1 pr-1 max-w-[200px]"
        )}
      >
        {isFolder ? (
          <Folder
            className={cn(
              styles["folder-item-icon"],
              "h-4 w-4 text-muted-foreground mr-1 flex-shrink-0"
            )}
          />
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
            <File
              className={cn(
                styles["file-item-icon"],
                "h-4 w-4 text-muted-foreground mr-1 flex-shrink-0"
              )}
            />
          )
        )}
        <span
          className={cn(
            styles["folder-item-name"],
            "text-xs truncate block w-full"
          )}
          title={itemName}
        >
          {itemName}
        </span>
      </div>

      <FileItemDropdown
        item={item}
        onMoveClick={onMoveClick}
        onRenameClick={onRenameClick}
        onDeleteClick={onDeleteClick}
      />
    </div>
  );
}
