"use client";

import { useEffect, useImperativeHandle, useRef, useState, useSyncExternalStore, type KeyboardEvent, type Ref } from "react";
import { root } from "@/content/filesystem";
import { complete, run } from "@/lib/terminal/commands";
import { HOME, displayPath } from "@/lib/terminal/fs";
import type { Block } from "@/lib/terminal/types";
import { useRouter } from "next/navigation";
import { Output } from "./Output";

interface Entry {
  id: number;
  /** Prompt to show before the command; null for system output. */
  prompt: string | null;
  input?: string;
  blocks: Block[];
}

export interface TerminalHandle {
  run: (cmd: string) => void;
  focus: () => void;
}

const QUICK = ["help", "about", "projects", "gui", "open photos", "contact", "ls"];

// "Last login" is the time the page loaded, read once on the client.
const loadedAt = typeof window === "undefined" ? null : new Date();
const noop = () => () => {};
const lastLoginText = () =>
  loadedAt
    ? `Last login: ${loadedAt.toDateString().slice(0, 10)} ${loadedAt.toTimeString().slice(0, 8)} on ttys000`
    : "\u00a0";

function initialEntries(): Entry[] {
  const state = { cwd: [...HOME], history: [] };
  return [
    {
      id: -2,
      prompt: "~",
      input: "neofetch",
      blocks: run("neofetch", { root, state, now: new Date() }).blocks,
    },
    {
      id: -1,
      prompt: null,
      blocks: [
        {
          kind: "line",
          spans: [
            { text: "Welcome. This whole site is a terminal. Type ", tone: "muted" },
            { text: "help", tone: "green", cmd: "help" },
            { text: ", or start with ", tone: "muted" },
            { text: "cat README.md", tone: "green", cmd: "cat README.md" },
            { text: ". Anything green or blue is clickable. Prefer a normal website? ", tone: "muted" },
            { text: "gui", tone: "green", cmd: "gui" },
          ],
        },
      ],
    },
  ];
}

function Prompt({ path }: { path: string }) {
  return (
    <span className="select-none">
      <span className="text-t-green">guest@runyan</span> <span className="font-semibold text-t-blue">{path}</span>{" "}
      <span className="text-t-fg">%</span>{" "}
    </span>
  );
}

export function Terminal({
  ref,
  onExit,
  onCwd,
  active,
}: {
  ref?: Ref<TerminalHandle>;
  onExit: () => void;
  onCwd?: (path: string) => void;
  active: boolean;
}) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [cwd, setCwd] = useState<string[]>([...HOME]);
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [caret, setCaret] = useState(0);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const lastLogin = useSyncExternalStore(noop, lastLoginText, () => "\u00a0");

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const idSeq = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(scrollToEnd, [entries, options]);

  const path = displayPath(cwd);
  useEffect(() => onCwd?.(path), [path, onCwd]);

  function execute(raw: string) {
    const cmd = raw.trim();
    const shownPrompt = displayPath(cwd);
    const newHistory = cmd && history[history.length - 1] !== cmd ? [...history, cmd] : history;
    setHistory(newHistory);
    setHistIdx(null);
    setDraft("");
    setInput("");
    setCaret(0);
    setOptions([]);

    const result = cmd
      ? run(cmd, { root, state: { cwd, history: newHistory }, now: new Date() })
      : { blocks: [] as Block[] };

    const entry: Entry = { id: idSeq.current++, prompt: shownPrompt, input: raw, blocks: result.blocks };
    // After `clear`, keep only what came after it (e.g. `clear && ls`), without the prompt.
    if (result.clear) setEntries(result.blocks.length || result.async ? [{ ...entry, prompt: null }] : []);
    else setEntries((prev) => [...prev, entry]);

    if (result.cwd) setCwd(result.cwd);

    if (result.open) {
      if (result.open.startsWith("mailto:")) window.location.href = result.open;
      else window.open(result.open, "_blank", "noopener,noreferrer");
    }

    if (result.navigate) {
      const to = result.navigate;
      setTimeout(() => router.push(to), 250);
    }

    if (result.async) {
      const base = result.blocks.filter((b) => !(b.kind === "line" && b.spans[0]?.text === "scanning…"));
      result
        .async()
        .then((more) => setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, blocks: [...base, ...more] } : e))))
        .catch(() =>
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entry.id
                ? { ...e, blocks: [{ kind: "line", spans: [{ text: "net: couldn't reach the server", tone: "red" }] }] }
                : e,
            ),
          ),
        );
    }

    if (result.exit) setTimeout(onExit, 350);
  }

  useImperativeHandle(ref, () => ({
    run: (cmd: string) => {
      execute(cmd);
      inputRef.current?.focus({ preventScroll: true });
    },
    focus: () => inputRef.current?.focus({ preventScroll: true }),
  }));

  function setLine(v: string) {
    setInput(v);
    setCaret(v.length);
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(v.length, v.length));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Tab") setOptions([]);

    if (e.key === "Enter") {
      e.preventDefault();
      execute(input);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const c = complete(input, { root, state: { cwd, history } });
      setLine(c.value);
      setOptions(c.options);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const idx = histIdx === null ? history.length - 1 : Math.max(0, histIdx - 1);
      if (histIdx === null) setDraft(input);
      setHistIdx(idx);
      setLine(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === null) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(null);
        setLine(draft);
      } else {
        setHistIdx(idx);
        setLine(history[idx]);
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setEntries([]);
    } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      setEntries((prev) => [...prev, { id: idSeq.current++, prompt: displayPath(cwd), input: `${input}^C`, blocks: [] }]);
      setLine("");
    } else if (e.ctrlKey && e.key.toLowerCase() === "u") {
      e.preventDefault();
      setLine("");
    }
  }

  const syncCaret = () => setCaret(inputRef.current?.selectionStart ?? input.length);

  const before = input.slice(0, caret);
  const at = input[caret] ?? " ";
  const after = input.slice(caret + 1);
  const showCursor = active;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onClick={() => {
          if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
        }}
        className="term-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-4 font-mono text-[13px] leading-[1.5] text-t-fg sm:px-5 sm:text-[13.5px]"
      >
        <div className="text-t-fg">{lastLogin}</div>

        {entries.map((e) => (
          <div key={e.id} className="fade-up">
            {e.prompt !== null && (
              <div className="whitespace-pre-wrap break-all">
                <Prompt path={e.prompt} />
                <span>{e.input}</span>
              </div>
            )}
            <Output blocks={e.blocks} onRun={(c) => execute(c)} onMedia={scrollToEnd} />
          </div>
        ))}

        {/* live prompt */}
        <label className="relative block cursor-text whitespace-pre-wrap break-all">
          <Prompt path={path} />
          <span>{before}</span>
          {showCursor ? (
            <span className={`${focused ? "cursor-block cursor-blink" : "cursor-hollow"}`}>{at}</span>
          ) : (
            <span>{at}</span>
          )}
          <span>{after}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setCaret(e.target.selectionStart ?? e.target.value.length);
              setHistIdx(null);
            }}
            onKeyDown={onKeyDown}
            onKeyUp={syncCaret}
            onSelect={syncCaret}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Terminal input. Type help for commands."
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            className="absolute inset-0 h-full w-full cursor-text bg-transparent text-[16px] text-transparent caret-transparent opacity-0 outline-none"
          />
        </label>

        {options.length > 0 && (
          <div className="flex flex-wrap gap-x-6 text-t-muted">
            {options.map((o) => (
              <span key={o}>{o}</span>
            ))}
          </div>
        )}
      </div>

      {/* quick commands for touch screens */}
      <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-3 py-2 font-mono text-[12px] sm:hidden">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => execute(q)}
            className="shrink-0 rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-t-green active:bg-white/15"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
