"use client";

import type { ReactNode } from "react";
import { useHorizontalScrollIndicator } from "@/hooks/useHorizontalScrollIndicator";
import styles from "./ScrollableRow.module.css";

interface ScrollableRowProps {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
}

export function ScrollableRow({
  children,
  ariaLabel,
  className,
}: ScrollableRowProps) {
  const scroll = useHorizontalScrollIndicator();

  return (
    <div className={className}>
      <section
        aria-label={ariaLabel}
        aria-roledescription="horizontally scrollable items"
        className={styles.scroll}
        onScroll={scroll.handleScroll}
        ref={scroll.scrollRef}
        tabIndex={0}
      >
        <div className={styles.content} ref={scroll.contentRef}>
          {children}
        </div>
      </section>
      <div
        aria-hidden="true"
        className={styles.track}
        data-measured={scroll.indicator.measured}
        ref={scroll.trackRef}
        {...scroll.trackHandlers}
      >
        <div
          className={styles.thumb}
          style={{
            width: `${scroll.indicator.width}%`,
            left: `${scroll.indicator.left}%`,
          }}
        />
      </div>
    </div>
  );
}
