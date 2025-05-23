import React from 'react';

import { cn } from '@/lib/utils';

import styles from './breadcrumbs.module.css';

interface BreadcrumbItemProps {
  part: string;
  isLast: boolean;
  currentAccumulatedPath: string;
  onNavigate: (path: string) => void;
  type: 'files' | 'media';
  isClickable?: boolean;
}

export function BreadcrumbItem({
  part,
  isLast,
  currentAccumulatedPath,
  onNavigate,
  type,
  isClickable = true
}: BreadcrumbItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(currentAccumulatedPath);
  };

  const itemClassName = cn(
    isClickable && styles.breadcrumbItemClickable,
    styles.breadcrumbItem,
    isLast && styles.breadcrumbCurrent,
    isClickable ? 'max-w-20 truncate' : '',
    isClickable ? 'cursor-pointer' : 'cursor-default'
  );

  if (type === 'files') {
    return isLast || !isClickable ? (
      <span className={itemClassName} title={part} style={{ minWidth: '30px' }}>
        {part}
      </span>
    ) : (
      <span className={itemClassName} title={part} onClick={handleClick} style={{ minWidth: '30px' }}>
        {part}
      </span>
    );
  }

  return (
    <span className={itemClassName} onClick={handleClick} title={part} style={{ minWidth: '30px' }}>
      {part}
    </span>
  );
}
