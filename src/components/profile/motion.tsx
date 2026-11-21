"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Fade + rise into place. `inView` waits until it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  inView = false,
  className,
}: {
  children: ReactNode;
  delay?: number;
  inView?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const target = { opacity: 1, y: 0 };
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 22 }}
      {...(inView
        ? { whileInView: target, viewport: { once: true, margin: "0px 0px -12% 0px" } }
        : { animate: target })}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Headline that rises in word by word. Wrap a word in {italic: true} to set it in maroon italics. */
export function SplitWords({
  words,
  className,
  delay = 0,
}: {
  words: (string | { text: string; italic: true })[];
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <h1 className={className}>
      {words.map((w, i) => {
        const text = typeof w === "string" ? w : w.text;
        const italic = typeof w !== "string";
        return (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top">
            <motion.span
              initial={reduce ? false : { y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: EASE_OUT, delay: delay + i * 0.06 }}
              className={`inline-block ${italic ? "pr-[0.06em] italic text-maroon" : ""}`}
            >
              {text}
            </motion.span>
            {i < words.length - 1 && " "}
          </span>
        );
      })}
    </h1>
  );
}
