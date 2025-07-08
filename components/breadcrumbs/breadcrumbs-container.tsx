import React from 'react';

import { ScrollableContainer } from '@/components/ui/scrollable-container';
import { cn } from '@/lib/utils';

import styles from './breadcrumbs.module.css';

interface BreadcrumbsContainerProps {
  children: React.ReactNode;
  currentPath: string;
}

export function BreadcrumbsContainer({ children, currentPath }: BreadcrumbsContainerProps) {
  return (
    <div className={cn(styles['breadcrumbs-container'], 'flex', 'items-center', 'w-full', 'max-w-full')}>
      <ScrollableContainer
        direction="horizontal"
        scrollToEnd={true}
        gradientSize={32}
        dependencies={[currentPath]}
        className={styles['breadcrumbs-scrollable']}
      >
        {children}
      </ScrollableContainer>
    </div>
  );
}
