"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Camera, Gamepad2, SquareTerminal, Wifi } from "lucide-react";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/ui/brand-icons";
import { Terminal, type TerminalHandle } from "./Terminal";

type WindowState = "open" | "minimized" | "closed";

const subscribeMinute = (cb: () => void) => {
  const t = setInterval(cb, 15_000);
  return () => clearInterval(t);
};
const clockText = () => {
  const now = new Date();
  return `${now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
};

function Clock() {
  const text = useSyncExternalStore(subscribeMinute, clockText, () => "");
  return <span>{text}</span>;
}

function TrafficLight({ color, label, onClick, glyph }: { color: string; label: string; onClick: () => void; glyph: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="grid h-3 w-3 place-items-center rounded-full text-[9px] leading-none font-bold text-black/0 group-hover:text-black/60"
      style={{ background: color, boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.25)" }}
    >
      {glyph}
    </button>
  );
}

/** Dock apps. `cmd: null` is the Terminal itself. */
const MENU = [["About", "cat ~/about.md"], ["Companies", "companies"], ["Projects", "projects"], ["Play", "play"], ["Tools", "sysinfo"], ["Experience", "cat ~/experience.md"], ["Contact", "contact"], ["Help", "help"]] as const;

const LINKABLE = new Set(["help", "flock", "sysinfo", "fingerprint", "ip", "ping", "pwcheck", "pwgen", "projects", "companies"]);

const DOCK = [
  { label: "Terminal", icon: SquareTerminal, cmd: null, color: "from-zinc-700 to-zinc-900" },
  { label: "Photos", icon: Camera, cmd: "open ~/photos", color: "from-amber-300 to-pink-500" },
  { label: "Play Iron Horizon", icon: Gamepad2, cmd: "play", color: "from-orange-500 to-red-700" },
  { label: "X", icon: XIcon, cmd: "x", color: "from-zinc-800 to-black" },
  { label: "GitHub", icon: GitHubIcon, cmd: "github", color: "from-zinc-500 to-zinc-800" },
  { label: "LinkedIn", icon: LinkedInIcon, cmd: "linkedin", color: "from-sky-500 to-sky-800" },
] as const;

export function Desktop() {
  const [win, setWin] = useState<WindowState>("open");
  const [maximized, setMaximized] = useState(false);
  const [cwd, setCwd] = useState("~");
  // Bumping the key remounts the terminal (fresh session after "close").
  const [session, setSession] = useState(0);
  const term = useRef<TerminalHandle>(null);
  const pending = useRef<string | null>(null);

  const open = () => {
    if (win === "closed") setSession((s) => s + 1);
    setWin("open");
    setTimeout(() => term.current?.focus(), 50);
  };

  /** Run a command from the dock/menu, opening the window first if needed. */
  const runInTerminal = (cmd: string) => {
    if (win === "open" && term.current) {
      term.current.run(cmd);
      return;
    }
    pending.current = cmd;
    open();
  };

  useEffect(() => {
    if (win === "open" && pending.current) {
      const cmd = pending.current;
      pending.current = null;
      setTimeout(() => term.current?.run(cmd), 80);
    }
  }, [win, session]);

  // Links like /?run=flock open the terminal with a demo running. Only these
  // argument-free commands are allowed, so a link can't type anything else.
  useEffect(() => {
    const url = new URL(window.location.href);
    const cmd = url.searchParams.get("run");
    if (!cmd) return;
    url.searchParams.delete("run");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    if (LINKABLE.has(cmd)) setTimeout(() => term.current?.run(cmd), 120);
  }, []);


  return (
    <div className="wallpaper relative flex h-dvh w-full flex-col overflow-hidden">
      {/* mountains */}
      <div aria-hidden className="ridge-far pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] opacity-80" />
      <div aria-hidden className="ridge pointer-events-none absolute inset-x-0 bottom-0 h-[26vh]" />

      {/* menu bar */}
      <header className="menubar relative z-20 hidden h-7 shrink-0 items-center justify-between px-4 text-[13px] text-white/90 sm:flex">
        <nav className="flex items-center gap-5">
          <span className="font-semibold">Terminal</span>
          {MENU.map(([label, cmd]) => (
            <button key={label} type="button" className="hover:text-white" onClick={() => runInTerminal(cmd)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-white/85">
          <Link href="/about" className="rounded px-1.5 hover:bg-white/15 hover:text-white">
            Regular site ↗
          </Link>
          <Wifi className="h-3.5 w-3.5" aria-hidden />
          <span className="font-medium">Dayton Runyan</span>
          <Clock />
        </div>
      </header>

      {/* window area */}
      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center sm:p-6 sm:pb-24">
        <h1 className="sr-only">Dayton Runyan — founder building VAL at Future 42. This site is an interactive terminal.</h1>

        {win === "open" && (
          <section
            aria-label="Terminal"
            className={`term-window window-in flex h-full w-full flex-col overflow-hidden sm:rounded-xl ${
              maximized ? "sm:h-full sm:w-full" : "sm:h-[min(680px,100%)] sm:w-[min(980px,100%)]"
            } transition-[width,height] duration-300`}
          >
            <div
              className="term-titlebar group relative flex h-9 shrink-0 items-center border-b border-black/60 px-3.5 select-none sm:h-8"
              onDoubleClick={() => setMaximized((m) => !m)}
            >
              <div className="relative z-10 flex gap-2">
                <TrafficLight color="#ff5f57" label="Close" glyph="×" onClick={() => setWin("closed")} />
                <TrafficLight color="#febc2e" label="Minimize" glyph="−" onClick={() => setWin("minimized")} />
                <TrafficLight color="#28c840" label="Zoom" glyph="+" onClick={() => setMaximized((m) => !m)} />
              </div>
              <div className="pointer-events-none absolute inset-x-0 truncate px-24 text-center text-[12.5px] font-medium text-white/60">
                <span className="hidden sm:inline">guest@runyan: </span>
                {cwd} — zsh
              </div>
            </div>
            <Terminal key={session} ref={term} active onExit={() => setWin("closed")} onCwd={setCwd} />
          </section>
        )}

        {win !== "open" && (
          <div className="fade-up flex flex-col items-center gap-4 text-center text-white/80">
            <p className="font-mono text-sm">
              {win === "closed" ? "[Process completed]" : "Terminal is minimized."}
            </p>
            <button
              type="button"
              onClick={open}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-mono text-sm text-white backdrop-blur hover:bg-white/20"
            >
              {win === "closed" ? "open a new terminal" : "restore terminal"}
            </button>
          </div>
        )}
      </main>

      {/* dock */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 hidden justify-center sm:flex">
        <div className="dock pointer-events-auto flex items-end gap-2 rounded-2xl px-2 pt-2 pb-1.5">
          {DOCK.map(({ label, icon: Icon, cmd, color }) => (
            <button
              key={label}
              type="button"
              onClick={() => (cmd ? runInTerminal(cmd) : open())}
              className="group relative flex flex-col items-center"
              aria-label={label}
            >
              <span className="pointer-events-none absolute -top-9 rounded-md bg-black/70 px-2 py-0.5 text-[12px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                {label}
              </span>
              <span
                className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-b ${color} shadow-lg ring-1 ring-white/20 transition-transform duration-200 group-hover:-translate-y-2 group-hover:scale-110`}
              >
                <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
              </span>
              <span className={`mt-1 h-1 w-1 rounded-full ${!cmd && win !== "closed" ? "bg-white/80" : "bg-transparent"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
