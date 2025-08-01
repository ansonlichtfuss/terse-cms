import { ChevronRight } from 'lucide-react';
import React from 'react';

import styles from './breadcrumbs.module.css';

export function BreadcrumbSeparator() {
  return (
    <span className={styles['breadcrumb-separator']}>
      <ChevronRight size={10} />
    </span>
  );
}
