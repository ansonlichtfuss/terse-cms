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
    isClickable && styles['breadcrumb-item-clickable'],
    styles['breadcrumb-item'],
    isLast && styles['breadcrumb-current'],
    isClickable ? 'cursor-pointer' : 'cursor-default'
  );

  return (
    <div className={itemClassName} title={part} onClick={isClickable ? handleClick : undefined}>
      {part}
    </div>
  );
}
