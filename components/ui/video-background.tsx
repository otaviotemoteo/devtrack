"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface VideoBackgroundProps {
  src: string;
  /** Tailwind classes for the legibility wash painted over the video. */
  overlayClassName?: string;
}

/**
 * Full-bleed, muted, looping video pinned behind page content (fixed to the
 * viewport). Sits below content (which should be `relative z-10`) and pauses
 * when the user prefers reduced motion.
 */
export function VideoBackground({
  src,
  overlayClassName = "bg-bg/60",
}: VideoBackgroundProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (reduceMotion) video.pause();
    else video.play().catch(() => {});
  }, [reduceMotion]);

  return (
    <div className="fixed inset-0 overflow-hidden" aria-hidden="true">
      <video
        ref={ref}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      />
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  );
}
