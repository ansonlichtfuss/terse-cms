"use client";

import { BreadcrumbSeparator } from "./BreadcrumbSeparator";
import { BreadcrumbItem } from "./BreadcrumbItem";
import { BreadcrumbsContainer } from "./BreadcrumbsContainer";
import React, { useRef, useLayoutEffect } from "react";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import styles from "./breadcrumbs.module.css";
import { cn } from "@/lib/utils";

interface PathBreadcrumbsProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  rootIcon?: React.ReactNode;
  type?: "files" | "media";
}

export function PathBreadcrumbs({
  currentPath,
  onNavigate,
  rootIcon = <Home size={12} />,
  type = "files",
}: PathBreadcrumbsProps) {
  // Handle root navigation
  const handleRootClick = () => {
    onNavigate("");
  };

  // Parse the path and create breadcrumb items
  const renderBreadcrumbItems = () => {
    if (!currentPath) {
      return null;
    }

    // Check if it's a root file (contains '.' but no '/')
    if (currentPath.includes(".") && !currentPath.includes("/")) {
      return null; // Only show root icon for root files
    }

    const parts = currentPath.split("/").filter(Boolean);
    let accumulatedPath = "";

    return parts.map((part, index) => {
      accumulatedPath += (accumulatedPath ? "/" : "") + part;
      const isLast = index === parts.length - 1;
      const currentAccumulatedPath = accumulatedPath;

      return (
        <React.Fragment key={part + index}>
          <BreadcrumbSeparator />
          <BreadcrumbItem
            part={part}
            isLast={isLast}
            currentAccumulatedPath={currentAccumulatedPath}
            onNavigate={onNavigate}
            type={type}
          />
        </React.Fragment>
      );
    });
  };

  return (
    <BreadcrumbsContainer currentPath={currentPath}>
      <Link
        href="/edit"
        className={cn(
          "inline-flex",
          styles.breadcrumbItem,
          "shrink-0",
          "truncate"
        )}
        onClick={(e) => {
          e.preventDefault();
          handleRootClick();
          return true;
        }}
      >
        {rootIcon}
      </Link>
      {renderBreadcrumbItems()}
    </BreadcrumbsContainer>
  );
}
