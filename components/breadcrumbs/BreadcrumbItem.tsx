import React from "react";
import Link from "next/link";
import styles from "./breadcrumbs.module.css";
import { cn } from "@/lib/utils";

interface BreadcrumbItemProps {
  part: string;
  isLast: boolean;
  currentAccumulatedPath: string;
  onNavigate: (path: string) => void;
  type: "files" | "media";
}

export function BreadcrumbItem({
  part,
  isLast,
  currentAccumulatedPath,
  onNavigate,
  type,
}: BreadcrumbItemProps) {
  if (type === "files") {
    return isLast ? (
      <span
        className={cn(
          styles.breadcrumbItem,
          isLast && styles.breadcrumbCurrent
        )}
        title={part}
        style={{ minWidth: "30px" }}
      >
        {part}
      </span>
    ) : (
      <Link
        href={`/edit/${encodeURIComponent(currentAccumulatedPath)}`}
        className={cn(styles.breadcrumbItem, "truncate")}
        title={part}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(currentAccumulatedPath);
          return true;
        }}
        style={{ minWidth: "30px" }}
      >
        {part}
      </Link>
    );
  }

  return (
    <span
      className={cn(
        styles.breadcrumbItem,
        isLast && styles.breadcrumbCurrent,
        "truncate"
      )}
      onClick={() => onNavigate(currentAccumulatedPath)}
      title={part}
      style={{ minWidth: "30px" }}
    >
      {part}
    </span>
  );
}
