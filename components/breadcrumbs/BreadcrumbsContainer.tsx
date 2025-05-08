import React, { useRef, useLayoutEffect } from "react";
import styles from "./breadcrumbs.module.css";

interface BreadcrumbsContainerProps {
  children: React.ReactNode;
  currentPath: string;
}

export function BreadcrumbsContainer({
  children,
  currentPath,
}: BreadcrumbsContainerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = React.useState(false);
  const [showRightGradient, setShowRightGradient] = React.useState(false);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const updateGradientVisibility = () => {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        setShowLeftGradient(scrollLeft > 0);
        setShowRightGradient(scrollLeft + clientWidth < scrollWidth);
      };

      updateGradientVisibility(); // Set initial state
      container.addEventListener("scroll", updateGradientVisibility);
      window.addEventListener("resize", updateGradientVisibility); // Update on resize

      // Scroll to the right initially
      container.scrollLeft = container.scrollWidth;

      return () => {
        container.removeEventListener("scroll", updateGradientVisibility);
        window.removeEventListener("resize", updateGradientVisibility);
      };
    }
  }, [currentPath]);

  return (
    <div
      className={`${styles.breadcrumbs} flex items-center w-full max-w-full relative`}
    >
      {/* Left Gradient */}
      <div
        className="absolute top-0 left-0 bottom-0 w-8 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))",
          opacity: showLeftGradient ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      ></div>

      {/* Right Gradient */}
      <div
        className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))",
          opacity: showRightGradient ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      ></div>

      <div
        ref={scrollContainerRef}
        className={`flex items-center flex-1 ${styles.scrollbarHidden}`}
        style={{ overflowX: "auto" }}
      >
        {children}
      </div>
    </div>
  );
}
