"use client";

import { useEffect, useRef, useState } from "react";
import {
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { Reveal } from "@/components/landing/reveal";

// ── Tune these to the delivered clip ──────────────────────────────────────
// FRAME_COUNT = number of files in public/frames (run `ls public/frames | wc -l`).
// 240 = the clip's native 24fps × 10s (every real frame; the smoothness ceiling
// without motion-interpolation, which would warp the on-screen UI text).
const FRAME_COUNT = 240;
// Where each of the 4 beats begins. First ~20% is the zoom-in (no square yet).
const STEP_THRESHOLDS = [0.2, 0.4, 0.6, 0.8];
const frameSrc = (i: number) => `/frames/f_${String(i + 1).padStart(4, "0")}.webp`;

const STEPS = [
  { n: 1, title: "Connect GitHub", body: "Sign in once. We read your commits and pull requests — nothing is written back." },
  { n: 2, title: "Run the scan", body: "Pick your sources and time range. DevTrack analyzes your real activity." },
  { n: 3, title: "AI writes your content", body: "Impact-focused copy, tuned for a global profile or a specific company." },
  { n: 4, title: "Paste into LinkedIn", body: "Copy each block into the matching field. You stay in control of every word." },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const images = useRef<HTMLImageElement[]>([]);
  const [activeStep, setActiveStep] = useState(-1);
  const [framesReady, setFramesReady] = useState(false);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Preload frames only when the section nears the viewport (never blocks first paint).
  useEffect(() => {
    if (reduceMotion) return;
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          images.current = Array.from({ length: FRAME_COUNT }, (_, i) => {
            const img = new Image();
            img.src = frameSrc(i);
            return img;
          });
          // Swap the placeholder out once the first real frame decodes.
          const first = images.current[0];
          if (first) {
            if (first.complete && first.naturalWidth > 0) setFramesReady(true);
            else first.addEventListener("load", () => setFramesReady(true), { once: true });
          }
          io.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduceMotion]);

  const draw = (i: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = images.current[i];
    if (canvas && ctx && img?.complete && img.naturalWidth > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  };

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const frame = Math.min(FRAME_COUNT - 1, Math.floor(p * FRAME_COUNT));
    requestAnimationFrame(() => draw(frame));
    setActiveStep(STEP_THRESHOLDS.filter((t) => p >= t).length - 1);
  });

  // Reduced motion: static layout, all steps shown, no pin/scrub.
  if (reduceMotion) {
    return <StaticHowItWorks />;
  }

  return (
    <>
      {/* Mobile (< md): no heavy scrub — stacked static layout. */}
      <StaticHowItWorks className="md:hidden" />

      {/* Desktop (md+): pinned scroll-scrub. */}
      <section
        ref={sectionRef}
        className="relative hidden border-y border-border bg-bg-soft md:block"
        style={{ height: "400vh" }}
      >
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-10 px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            How it works
          </h2>
          <div className="grid w-full max-w-6xl grid-cols-2 items-center gap-12">
            <Roadmap activeStep={activeStep} />
            <ScrubPanel canvasRef={canvasRef} framesReady={framesReady} />
          </div>
        </div>
      </section>
    </>
  );
}

/** Static, non-scrubbing variant — used on mobile and for prefers-reduced-motion. */
function StaticHowItWorks({ className = "" }: { className?: string }) {
  return (
    <section className={`border-y border-border bg-bg-soft ${className}`}>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            How it works
          </h2>
        </Reveal>
        <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
          <Roadmap activeStep={STEPS.length - 1} />
          <StaticPanel />
        </div>
      </div>
    </section>
  );
}

function Roadmap({ activeStep }: { activeStep: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {STEPS.map((s, i) => {
        const done = i <= activeStep;
        return (
          <div
            key={s.n}
            className={`rounded-card border p-5 transition-all duration-500 ${
              done ? "border-green bg-green-soft shadow-soft" : "border-border bg-bg"
            }`}
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full font-mono text-sm transition-colors duration-500 ${
                done ? "bg-green text-white" : "bg-bg-soft text-ink-soft"
              }`}
            >
              {done ? <CheckIcon className="h-4 w-4" /> : s.n}
            </span>
            <h3 className="mt-4 text-[15px] font-semibold text-ink">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </div>
        );
      })}
    </div>
  );
}

/** Canvas surface for the scroll-scrubbed frames, with a placeholder until they load. */
function ScrubPanel({
  canvasRef,
  framesReady,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  framesReady: boolean;
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-card border border-border bg-bg shadow-soft">
      <canvas ref={canvasRef} width={1280} height={720} className="h-full w-full" />
      {!framesReady && <Placeholder />}
    </div>
  );
}

/**
 * Static (non-scrubbed) view of the workflow, shown on small screens and for
 * reduced motion. The clip autoplays muted/looping; reduced motion pauses it on
 * the poster frame.
 */
function StaticPanel() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  // Play only while the clip is actually on screen; pause when it scrolls away.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (reduceMotion) {
      video.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduceMotion]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-card border border-border bg-bg shadow-soft">
      <video
        ref={ref}
        src="/workflow.mp4"
        poster={frameSrc(0)}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/** On-brand stand-in shown where the workflow clip will render (until frames land). */
function Placeholder() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-bg-soft">
      <span className="relative inline-flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex h-4 w-4 rounded-full bg-green" />
      </span>
    </div>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
