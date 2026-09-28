"use client";

import {
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface IndicatorGeometry {
  width: number;
  left: number;
  measured: boolean;
}

const initialGeometry: IndicatorGeometry = {
  width: 100,
  left: 0,
  measured: false,
};

export function useHorizontalScrollIndicator() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const activePointerRef = useRef<number | null>(null);
  const [indicator, setIndicator] = useState(initialGeometry);

  const measure = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const { scrollWidth, clientWidth, scrollLeft } = element;
    const width =
      clientWidth > 0 && scrollWidth > clientWidth
        ? (clientWidth / scrollWidth) * 100
        : 100;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
    const left = progress * (100 - width);

    setIndicator((current) =>
      current.measured && current.width === width && current.left === left
        ? current
        : { width, left, measured: true },
    );
  }, []);

  const scheduleMeasure = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      measure();
    });
  }, [measure]);

  useEffect(() => {
    measure();

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleMeasure);
    if (scrollRef.current) {
      observer?.observe(scrollRef.current);
    }
    if (contentRef.current) {
      observer?.observe(contentRef.current);
    }

    return () => {
      observer?.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      activePointerRef.current = null;
    };
  }, [measure, scheduleMeasure]);

  function scrollToClientX(clientX: number) {
    const element = scrollRef.current;
    const track = trackRef.current;
    if (!element || !track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }

    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
    element.scrollLeft = Math.max(
      0,
      Math.min(
        maxScroll,
        ratio * element.scrollWidth - element.clientWidth / 2,
      ),
    );
    scheduleMeasure();
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    activePointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    scrollToClientX(event.clientX);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (activePointerRef.current === event.pointerId) {
      scrollToClientX(event.clientX);
    }
  }

  function stopPointer(event: PointerEvent<HTMLDivElement>) {
    if (activePointerRef.current !== event.pointerId) {
      return;
    }

    activePointerRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleLostPointerCapture(event: PointerEvent<HTMLDivElement>) {
    if (activePointerRef.current === event.pointerId) {
      activePointerRef.current = null;
    }
  }

  return {
    scrollRef,
    contentRef,
    trackRef,
    indicator,
    handleScroll: scheduleMeasure,
    trackHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: stopPointer,
      onPointerCancel: stopPointer,
      onLostPointerCapture: handleLostPointerCapture,
    },
  };
}
