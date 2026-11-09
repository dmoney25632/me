"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

type Mode = "system" | "light" | "dark";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

function readMode(): Mode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyMode(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && systemPrefersDark());
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

function setMode(mode: Mode) {
  try {
    if (mode === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // storage blocked — the choice still applies for this visit
  }
  applyMode(mode);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // While on "system", follow the OS when it flips light/dark.
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readMode() === "system") applyMode("system");
  };
  mq.addEventListener("change", onSystemChange);
  return () => {
    listeners.delete(listener);
    mq.removeEventListener("change", onSystemChange);
  };
}

const options: { mode: Mode; label: string; icon: LucideIcon }[] = [
  { mode: "system", label: "System theme", icon: Monitor },
  { mode: "light", label: "Light theme", icon: Sun },
  { mode: "dark", label: "Dark theme", icon: Moon },
];

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, readMode, () => "system" as Mode);

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="flex items-center rounded-full border border-border bg-surface/60 p-0.5"
    >
      {options.map(({ mode: m, label, icon: Icon }) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setMode(m)}
            className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              active ? "text-foreground" : "text-subtle hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="theme-pill"
                className="absolute inset-0 rounded-full bg-background shadow-sm ring-1 ring-border"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="relative h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
