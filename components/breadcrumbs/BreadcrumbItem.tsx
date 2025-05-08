import React from "react";
import Link from "next/link";
import styles from "./breadcrumbs.module.css";

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
        className={`${styles.breadcrumbItem} ${
          isLast ? styles.breadcrumbCurrent : ""
        } truncate`}
        title={part}
        style={{ minWidth: "30px" }}
      >
        {part}
      </span>
    ) : (
      <Link
        href={`/edit/${encodeURIComponent(currentAccumulatedPath)}`}
        className={`${styles.breadcrumbItem} truncate`}
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
      className={`${styles.breadcrumbItem} ${
        isLast ? styles.breadcrumbCurrent : ""
      } truncate`}
      onClick={() => onNavigate(currentAccumulatedPath)}
      title={part}
      style={{ minWidth: "30px" }}
    >
      {part}
    </span>
  );
}
