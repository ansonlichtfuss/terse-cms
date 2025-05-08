import React from "react";
import { ChevronRight } from "lucide-react";
import styles from "./breadcrumbs.module.css";

export function BreadcrumbSeparator() {
  return (
    <span className={styles.breadcrumbSeparator}>
      <ChevronRight size={10} />
    </span>
  );
}
