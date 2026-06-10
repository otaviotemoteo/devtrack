"use client";

import Link from "next/link";
import { motion } from "motion/react";

function GitHubMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.85 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.79.62-3.38-1.37-3.38-1.37-.46-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.4 9.4 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

interface CtaButtonProps {
  size?: "md" | "lg";
  /** Adds a breathing glow + hover/tap scale (use for the primary page CTA). */
  glow?: boolean;
}

export function CtaButton({ size = "md", glow = false }: CtaButtonProps) {
  const pad = size === "lg" ? "px-7 py-3.5 text-base" : "px-6 py-3";

  const link = (
    <Link
      href="/login"
      className={`inline-flex items-center gap-2.5 rounded-btn bg-green font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark ${pad}`}
    >
      <GitHubMark className="h-5 w-5" />
      Sign in with GitHub
    </Link>
  );

  if (!glow) return link;

  return (
    <motion.div
      className="inline-flex rounded-btn"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        boxShadow: [
          "0 0 0 rgba(52,160,95,0)",
          "0 0 24px rgba(52,160,95,0.35)",
          "0 0 0 rgba(52,160,95,0)",
        ],
      }}
      transition={{
        boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.2 },
      }}
    >
      {link}
    </motion.div>
  );
}
