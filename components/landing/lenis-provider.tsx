"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Enables Lenis smooth-scroll for its subtree (the landing page).
 * Respects prefers-reduced-motion by skipping initialization.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
