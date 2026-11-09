"use client";

import { motion, useReducedMotion } from "framer-motion";

interface LogoProps {
  className?: string;
  /** Draw the strokes in on mount. */
  animate?: boolean;
}

/**
 * "DR." monogram drawn from strokes so it scales crisply and can animate.
 * Mirrors src/app/icon.svg (the favicon).
 */
export function Logo({ className, animate = false }: LogoProps) {
  const reduce = useReducedMotion();
  const draw = animate && !reduce;

  const stroke = (delay: number) =>
    draw
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { duration: 0.9, ease: "easeInOut" as const, delay },
            opacity: { duration: 0.01, delay },
          },
        }
      : {};

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="DR logo"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path d="M6 9V23M6 9H9.5A7 7 0 0 1 9.5 23H6" {...stroke(0)} />
        <motion.path
          d="M19 23V9H22.4A3.6 3.6 0 0 1 22.4 16.2H19M22 16.2L25.6 23"
          {...stroke(0.35)}
        />
      </g>
      <motion.circle
        cx={28.4}
        cy={22.6}
        r={1.6}
        className="fill-accent"
        {...(draw
          ? {
              initial: { scale: 0 },
              animate: { scale: 1 },
              transition: { type: "spring", stiffness: 400, damping: 12, delay: 1.1 },
            }
          : {})}
        style={{ transformOrigin: "28.4px 22.6px" }}
      />
    </svg>
  );
}
