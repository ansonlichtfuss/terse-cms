import type { FileNode } from "@/types";

import type { FileItem } from "./FileBrowser"; // Assuming FileItem type remains in the main file for now

// Convert FileNode to FileItem
export const fileNodeToFileItem = (node: FileNode): FileItem => {
  return {
    key: node.path,
    path: node.path,
    name: node.name,
    type: node.type,
    children: node.children ? node.children.map(fileNodeToFileItem) : undefined,
  };
};

export const getItemName = (item?: FileItem): string => {
  if (!item) return "";
  if (item.name) return item.name;

  // For S3 items that don't have a name property
  const key = item.key;
  // Remove trailing slash for folders
  const cleanKey = key.endsWith("/") ? key.slice(0, -1) : key;
  // Get the last part of the path
  const parts = cleanKey.split("/");
  return parts[parts.length - 1] || "Root";
};

export const getItemPath = (item: FileItem): string => {
  return item.path || item.key;
};
