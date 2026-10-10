"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Keep the two connection assets at the same size, even when work cards expand. */
export default function ConnectedBackdrops({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const upper = container?.querySelector<HTMLElement>('[data-connection="outgoing"]');
    if (!container || !upper) return;

    const align = () => {
      const { width, height } = upper.getBoundingClientRect();
      // Match the upper artwork's cover size, including its feathered overscan.
      const size = Math.max(width * 1.08, height + 128);
      container.style.setProperty("--linked-sculpture-size", `${size}px`);
      // Align the curved stem at the 64px overlap of connection.png.
      container.style.setProperty("--linked-stem-offset", `${120 - size * 0.01}px`);
    };

    const observer = new ResizeObserver(align);
    observer.observe(upper);
    align();
    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef} data-connected-backdrops>{children}</div>;
}
