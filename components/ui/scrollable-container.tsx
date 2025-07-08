import React, { useLayoutEffect } from 'react';

import { type ScrollDirection, useScrollGradients } from '@/hooks/use-scroll-gradients';
import { cn } from '@/lib/utils';

interface ScrollableContainerProps {
  children: React.ReactNode;
  className?: string;
  direction?: ScrollDirection;
  scrollToEnd?: boolean;
  gradientSize?: number;
  dependencies?: unknown[];
}

export function ScrollableContainer({
  children,
  className,
  direction = 'horizontal',
  scrollToEnd = false,
  gradientSize = 32,
  dependencies = []
}: ScrollableContainerProps) {
  const { scrollContainerRef, showStartGradient, showEndGradient } = useScrollGradients(direction, dependencies);

  useLayoutEffect(() => {
    if (scrollToEnd && scrollContainerRef.current) {
      if (direction === 'horizontal') {
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
      } else {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
  }, [scrollToEnd, scrollContainerRef, direction, ...dependencies]);

  const isHorizontal = direction === 'horizontal';

  const startGradientStyle = {
    [isHorizontal ? 'width' : 'height']: `${gradientSize}px`,
    background: isHorizontal
      ? 'linear-gradient(to right, var(--background), transparent)'
      : 'linear-gradient(to bottom, var(--background), transparent)',
    opacity: showStartGradient ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out'
  };

  const endGradientStyle = {
    [isHorizontal ? 'width' : 'height']: `${gradientSize}px`,
    background: isHorizontal
      ? 'linear-gradient(to left, var(--background), transparent)'
      : 'linear-gradient(to top, var(--background), transparent)',
    opacity: showEndGradient ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out'
  };

  const startGradientClasses = cn(
    'absolute pointer-events-none z-10',
    isHorizontal ? 'top-0 left-0 bottom-0' : 'top-0 left-0 right-0'
  );

  const endGradientClasses = cn(
    'absolute pointer-events-none z-10',
    isHorizontal ? 'top-0 right-0 bottom-0' : 'bottom-0 left-0 right-0'
  );

  const scrollContainerClasses = cn(
    'relative flex flex-1',
    isHorizontal ? 'items-center overflow-x-auto' : 'flex-col overflow-y-auto',
    className
  );

  return (
    <div className={cn('relative', isHorizontal ? 'w-full max-w-full' : 'h-full max-h-full')}>
      {/* Start Gradient (Left/Top) */}
      <div className={startGradientClasses} style={startGradientStyle} />

      {/* End Gradient (Right/Bottom) */}
      <div className={endGradientClasses} style={endGradientStyle} />

      <div ref={scrollContainerRef} className={scrollContainerClasses}>
        {children}
      </div>
    </div>
  );
}
