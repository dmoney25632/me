"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  children?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  children,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`mb-12 md:mb-16 ${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-accent">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          {description}
        </p>
      )}
      {children}
    </motion.div>
  );
}
