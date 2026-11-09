"use client";

import { motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/data/site";

interface WordmarkProps {
  className?: string;
  /** Letters rise in one by one on mount. */
  animate?: boolean;
}

/**
 * "Dayton Runyan." set in the display font (Instrument Serif italic).
 * Change the font in src/app/layout.tsx (the `display` font).
 */
export function Wordmark({ className = "", animate = false }: WordmarkProps) {
  const reduce = useReducedMotion();
  const letters = Array.from(siteConfig.name);

  return (
    <span
      className={`font-display inline-block whitespace-nowrap italic leading-none tracking-[-0.02em] ${className}`}
      aria-label={siteConfig.name}
    >
      {animate && !reduce ? (
        <span aria-hidden>
          {letters.map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: "0.35em", filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 + i * 0.035 }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
          ))}
          <motion.span
            className="inline-block not-italic text-accent"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 14,
              delay: 0.25 + letters.length * 0.035,
            }}
          >
            .
          </motion.span>
        </span>
      ) : (
        <span aria-hidden>
          {siteConfig.name}
          <span className="not-italic text-accent">.</span>
        </span>
      )}
    </span>
  );
}
