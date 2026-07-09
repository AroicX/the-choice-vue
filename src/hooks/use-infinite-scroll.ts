"use client";

import { useCallback, useEffect, useRef } from "react";

export function useInfiniteScroll(onLoadMore: () => void, enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    onLoadMore();
  }, [onLoadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!enabled || !node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, handleLoadMore]);

  return sentinelRef;
}
