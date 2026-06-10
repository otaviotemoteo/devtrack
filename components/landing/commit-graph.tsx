"use client";

import { motion } from "motion/react";

/**
 * Animated commit-graph motif for the hero: edges draw in, nodes spring in
 * staggered, and a green dot rides the main spine (the GitHub → LinkedIn metaphor).
 */
const NODES = [
  { x: 60, y: 200 },
  { x: 140, y: 150 },
  { x: 220, y: 210 },
  { x: 300, y: 120 },
  { x: 300, y: 250 },
  { x: 390, y: 90 },
  { x: 400, y: 180 },
  { x: 470, y: 230 },
];

const EDGES = [
  [0, 1],
  [1, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [3, 6],
  [6, 7],
  [4, 7],
];

// Main spine the traveling dot follows: 0 → 1 → 3 → 6 → 7.
const SPINE = "M60,200 L140,150 L300,120 L400,180 L470,230";

export function CommitGraph() {
  return (
    <svg
      viewBox="0 0 520 340"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {EDGES.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="var(--color-green)"
          strokeOpacity={0.35}
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      ))}

      {NODES.map((n, i) => (
        <motion.g
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 300, damping: 18 }}
          // fill-box + center origin → each node scales from its own center (SVG gotcha).
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <circle cx={n.x} cy={n.y} r={13} fill="var(--color-green-soft)" />
          <circle cx={n.x} cy={n.y} r={6} fill="var(--color-green)" />
        </motion.g>
      ))}

      {/* Traveling dot. If offsetPath misbehaves on older engines, swap for
          <circle r={5}><animateMotion><mpath href="#spine"/></animateMotion></circle>. */}
      <motion.circle
        r={5}
        fill="var(--color-green-dark)"
        style={{ offsetPath: `path("${SPINE}")` }}
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: 1.4 }}
      />
    </svg>
  );
}
