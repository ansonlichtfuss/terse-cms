'use client';

import { Home } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

import { BreadcrumbItem } from './breadcrumb-item';
import { BreadcrumbSeparator } from './breadcrumb-separator';
import styles from './breadcrumbs.module.css';
import { BreadcrumbsContainer } from './breadcrumbs-container';

interface PathBreadcrumbsProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  rootIcon?: React.ReactNode;
  type?: 'files' | 'media';
  isClickable?: boolean;
}

export function PathBreadcrumbs({
  currentPath,
  onNavigate,
  rootIcon = <Home size={12} />,
  type = 'files',
  isClickable = true
}: PathBreadcrumbsProps) {
  // Handle root navigation
  const handleRootClick = (e: React.MouseEvent) => {
    if (isClickable) {
      e.preventDefault();
      onNavigate('');
    }
  };

  // Parse the path and create breadcrumb items
  const renderBreadcrumbItems = () => {
    if (!currentPath) {
      return null;
    }

    // Check if it's a root file (contains '.' but no '/')
    if (currentPath.includes('.') && !currentPath.includes('/')) {
      return null; // Only show root icon for root files
    }

    const parts = currentPath.split('/').filter(Boolean);
    let accumulatedPath = '';

    return parts.map((part, index) => {
      accumulatedPath += (accumulatedPath ? '/' : '') + part;
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
            isClickable={isClickable}
          />
        </React.Fragment>
      );
    });
  };

  return (
    <BreadcrumbsContainer currentPath={currentPath}>
      {isClickable ? (
        <span
          className={cn(
            isClickable && styles['breadcrumb-item-clickable'],
            'inline-flex',
            styles['breadcrumb-item'],
            'shrink-0',
            isClickable ? 'max-w-20 truncate' : '',
            isClickable ? 'cursor-pointer' : 'cursor-default'
          )}
          onClick={handleRootClick}
        >
          {rootIcon}
        </span>
      ) : (
        <span
          className={cn(
            isClickable && styles['breadcrumb-item-clickable'],
            'inline-flex',
            styles['breadcrumb-item'],
            'shrink-0',
            isClickable ? 'max-w-20 truncate' : '',
            isClickable ? 'cursor-pointer' : 'cursor-default'
          )}
          onClick={handleRootClick}
        >
          {rootIcon}
        </span>
      )}
      {renderBreadcrumbItems()}
    </BreadcrumbsContainer>
  );
}
