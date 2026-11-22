"use client";

import { useEffect, useImperativeHandle, useRef, useState, useSyncExternalStore, type KeyboardEvent, type Ref } from "react";
import { neofetchCard, root } from "@/content/filesystem";
import { complete, redact, run } from "@/lib/terminal/commands";
import { HOME, displayPath } from "@/lib/terminal/fs";
import type { Block, CommandResult } from "@/lib/terminal/types";
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

const QUICK = ["help", "about", "companies", "projects", "play", "sysinfo", "pwcheck", "encrypt hello", "flock", "ip", "contact", "gui"];

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
      blocks: run("neofetch", { root, state, now: new Date(), card: neofetchCard }).blocks,
    },
    {
      id: -1,
      prompt: null,
      blocks: [
        {
          kind: "line",
          spans: [
            { text: "Welcome. This whole site is a terminal, and anything green is clickable. Try ", tone: "muted" },
            { text: "companies", tone: "green", cmd: "companies" },
            { text: ", ", tone: "muted" },
            { text: "projects", tone: "green", cmd: "projects" },
            { text: ", ", tone: "muted" },
            { text: "play", tone: "green", cmd: "play" },
            { text: " a game I made, or ", tone: "muted" },
            { text: "help", tone: "green", cmd: "help" },
            { text: ". It also runs real Rust on your machine: ", tone: "muted" },
            { text: "sysinfo", tone: "green", cmd: "sysinfo" },
            { text: ", ", tone: "muted" },
            { text: "pwcheck", tone: "green", cmd: "pwcheck" },
            { text: ", ", tone: "muted" },
            { text: "encrypt", tone: "green", cmd: 'encrypt "meet me at noon"' },
            { text: ", ", tone: "muted" },
            { text: "flock", tone: "green", cmd: "flock" },
            { text: ". Prefer a normal website? ", tone: "muted" },
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
  /** A no-echo prompt (password:) waiting for an answer, attached to an entry. */
  const [asking, setAsking] = useState<{ entryId: number; label: string; then: (a: string) => CommandResult } | null>(null);
  const lastLogin = useSyncExternalStore(noop, lastLoginText, () => "\u00a0");

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const idSeq = useRef(0);
  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);
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

  const ctxFor = (state: { cwd: string[]; history: string[] }) => ({ root, state, now: new Date(), card: neofetchCard });

  const appendTo = (entryId: number, blocks: Block[]) =>
    setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, blocks: [...e.blocks, ...blocks] } : e)));

  /** Apply a command's result to an entry already on screen (its blocks are there). */
  function follow(result: CommandResult, entryId: number, start: number) {
    if (result.cwd) setCwd(result.cwd);

    if (result.open) {
      if (result.open.startsWith("mailto:")) window.location.href = result.open;
      else window.open(result.open, "_blank", "noopener,noreferrer");
    }

    if (result.navigate) {
      const to = result.navigate;
      setTimeout(() => router.push(to), 250);
    }

    // Async output replaces this result's own placeholder lines ("checking…").
    if (result.async) {
      const replace = (more: Block[]) =>
        setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, blocks: [...e.blocks.slice(0, start), ...more] } : e)));
      result
        .async(replace)
        .then(replace)
        .catch((err: unknown) =>
          replace([{ kind: "line", spans: [{ text: `error: ${err instanceof Error ? err.message : "something went wrong"}`, tone: "red" }] }]),
        );
    }

    if (result.ask) setAsking({ entryId, label: result.ask.label, then: result.ask.then });

    if (result.exit) setTimeout(onExit, 350);
  }

  function answer(value: string) {
    if (!asking) return;
    const { entryId, label, then } = asking;
    setAsking(null);
    setInput("");
    setCaret(0);
    const result = then(value);
    // Show the prompt that was answered (never the answer), then what came of it.
    const shown = entriesRef.current.find((e) => e.id === entryId)?.blocks ?? [];
    const base: Block[] = [...shown, { kind: "line", spans: [{ text: label, tone: "muted" }] }];
    setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, blocks: [...base, ...result.blocks] } : e)));
    follow(result, entryId, base.length);
  }

  /** Close an open password prompt as if ctrl+C was pressed. */
  function cancelAsk() {
    if (!asking) return;
    appendTo(asking.entryId, [{ kind: "line", spans: [{ text: `${asking.label} ^C`, tone: "muted" }] }]);
    setAsking(null);
  }

  /**
   * `typed` is true only for Enter in the input. A click on a green command
   * while a password prompt is open cancels the prompt instead of being sent
   * as the answer.
   */
  function execute(raw: string, typed = false) {
    if (asking) {
      if (typed) return answer(raw);
      cancelAsk();
    }
    const cmd = raw.trim();
    const shownPrompt = displayPath(cwd);
    const remembered = redact(cmd);
    const newHistory = cmd && history[history.length - 1] !== remembered ? [...history, remembered] : history;
    setHistory(newHistory);
    setHistIdx(null);
    setDraft("");
    setInput("");
    setCaret(0);
    setOptions([]);

    const result = cmd ? run(cmd, ctxFor({ cwd, history: newHistory })) : { blocks: [] as Block[] };

    const entry: Entry = { id: idSeq.current++, prompt: shownPrompt, input: redact(raw), blocks: result.blocks };
    // After `clear`, keep only what came after it (e.g. `clear && ls`), without the prompt.
    if (result.clear) setEntries(result.blocks.length || result.async || result.ask ? [{ ...entry, prompt: null }] : []);
    else setEntries((prev) => [...prev, entry]);

    follow(result, entry.id, 0);
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
      execute(input, true);
    } else if (asking && (e.key === "Tab" || e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
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
    } else if (e.ctrlKey && e.key.toLowerCase() === "c" && asking) {
      e.preventDefault();
      cancelAsk();
      setLine("");
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
          {asking ? (
            <span className="select-none text-t-yellow">
              {asking.label}{" "}
              <span className="text-t-muted">{"•".repeat(Math.min(input.length, 40))}</span>
            </span>
          ) : (
            <>
              <Prompt path={path} />
              <span>{before}</span>
            </>
          )}
          {asking ? (
            showCursor && <span className={`${focused ? "cursor-block cursor-blink" : "cursor-hollow"}`}> </span>
          ) : showCursor ? (
            <span className={`${focused ? "cursor-block cursor-blink" : "cursor-hollow"}`}>{at}</span>
          ) : (
            <span>{at}</span>
          )}
          {!asking && <span>{after}</span>}
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
            aria-label={asking ? asking.label : "Terminal input. Type help for commands."}
            type={asking ? "password" : "text"}
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
