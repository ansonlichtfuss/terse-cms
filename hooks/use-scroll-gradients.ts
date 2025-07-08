import { useLayoutEffect, useRef, useState } from 'react';

export type ScrollDirection = 'horizontal' | 'vertical';

export function useScrollGradients(direction: ScrollDirection = 'horizontal', dependencies: unknown[] = []) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showStartGradient, setShowStartGradient] = useState(false);
  const [showEndGradient, setShowEndGradient] = useState(false);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const updateGradientVisibility = () => {
        if (direction === 'horizontal') {
          const { scrollLeft, scrollWidth, clientWidth } = container;
          setShowStartGradient(scrollLeft > 0);
          setShowEndGradient(scrollLeft + clientWidth < scrollWidth);
        } else {
          const { scrollTop, scrollHeight, clientHeight } = container;
          setShowStartGradient(scrollTop > 0);
          setShowEndGradient(scrollTop + clientHeight < scrollHeight);
        }
      };

      updateGradientVisibility();
      container.addEventListener('scroll', updateGradientVisibility);
      window.addEventListener('resize', updateGradientVisibility);

      return () => {
        container.removeEventListener('scroll', updateGradientVisibility);
        window.removeEventListener('resize', updateGradientVisibility);
      };
    }
  }, [direction, ...dependencies]);

  return { scrollContainerRef, showStartGradient, showEndGradient };
}
