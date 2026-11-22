// Commands that run real code on the visitor's machine: the Rust toolkit
// (rust/kit, via src/lib/kit.ts) and what the browser reveals about itself.
//
// Nothing here is sent anywhere. Passwords and passphrases are asked for
// with a no-echo prompt, never saved to history, and wiped from WebAssembly
// memory after use.

import { ITERATIONS, PW, RANDOM_BYTES, fromBase64Url, loadKit, toBase64Url, toHex, type Kit } from "../kit";
import type { Block, Command, CommandResult, Context, Span, Tone } from "./types";

const s = (text: string, tone?: Tone, extra?: Partial<Span>): Span => ({ text, tone, ...extra });
const line = (...spans: (Span | string)[]): Block => ({
  kind: "line",
  spans: spans.map((x) => (typeof x === "string" ? { text: x } : x)),
});
const err = (text: string): CommandResult => ({ blocks: [line(s(text, "red"))] });
const row = (k: string, v: string | Span | null | undefined, width = 12): Block =>
  line(s(k.padEnd(width), "green"), v == null || v === "" ? s("(not shared)", "muted") : v);
const note = (text: string) => line(s(text, "muted"));
const fmt = new Intl.NumberFormat("en-US");

const kitOf = (ctx: Context) => (ctx.kit ?? loadKit)();
const randomOf = (ctx: Context) => ctx.random ?? ((n: number) => crypto.getRandomValues(new Uint8Array(n)));
/** Let the browser paint the "working…" line before a blocking computation. */
const breathe = () => new Promise((r) => setTimeout(r, 30));
const hasWindow = () => typeof window !== "undefined" && typeof navigator !== "undefined";

// ------------------------------------------------------------------ passwords

/** Seconds → "3 hours", "2 centuries", "40 million years", … */
export function duration(sec: number): string {
  if (!Number.isFinite(sec) || sec > 4.3e17) return "longer than the universe has existed";
  if (sec < 1) return "instantly";
  const years = sec / 3.156e7;
  if (years >= 1e9) return `${fmt.format(Math.round(years / 1e9))} billion years`;
  if (years >= 1e6) return `${fmt.format(Math.round(years / 1e6))} million years`;
  if (years >= 1000) return `${fmt.format(Math.round(years / 1000))} thousand years`;
  const units: [number, string, string][] = [
    [3.156e9, "century", "centuries"],
    [3.156e7, "year", "years"],
    [2.63e6, "month", "months"],
    [86400, "day", "days"],
    [3600, "hour", "hours"],
    [60, "minute", "minutes"],
    [1, "second", "seconds"],
  ];
  const [n, one, many] = units.find(([n]) => sec >= n)!;
  const v = Math.round(sec / n);
  return `${fmt.format(v)} ${v === 1 ? one : many}`;
}

const LEVELS: { min: number; label: string; tone: Tone }[] = [
  { min: 80, label: "very strong", tone: "green" },
  { min: 60, label: "strong", tone: "green" },
  { min: 40, label: "fair", tone: "yellow" },
  { min: 25, label: "weak", tone: "red" },
  { min: -1, label: "very weak", tone: "red" },
];

function meter(bits: number): Block {
  const lvl = LEVELS.find((l) => bits >= l.min)!;
  const filled = Math.max(1, Math.min(20, Math.round(bits / 5)));
  return line(s("strength".padEnd(12), "green"), s("█".repeat(filled), lvl.tone), s("░".repeat(20 - filled), "muted"), "  ", s(lvl.label, lvl.tone));
}

export function passwordReport(kit: Kit, pw: string): Block[] {
  const r = kit.password(pw);
  const guesses = 2 ** Math.max(0, r.bits - 1); // on average you find it halfway through
  const noticed: string[] = [];
  if (r.flags & PW.leaked) noticed.push("it's on the list of most-leaked passwords. crackers try those first");
  if (r.flags & PW.word) noticed.push("a common word (even with l33t swaps like @ for a)");
  if (r.flags & PW.year) noticed.push("a year");
  if (r.flags & PW.sequence) noticed.push("a keyboard or alphabet run (qwerty, abc, 123)");
  if (r.flags & PW.repeat) noticed.push("repeated characters");
  if (r.flags & PW.short) noticed.push("fewer than 8 characters");

  const tips: string[] = [];
  if (r.bits < 60) {
    if (r.length < 14) tips.push("length beats complexity: aim for 14+ characters");
    if (r.flags & (PW.word | PW.leaked)) tips.push("four or more random words beat one clever word");
    tips.push("or let a password manager make one");
  }

  return [
    meter(r.bits),
    row("entropy", `~${Math.round(r.bits)} bits  (${guesses < 1e6 ? fmt.format(Math.ceil(guesses)) : `about 10^${Math.floor(Math.log10(guesses))}`} guesses)`),
    row("length", `${r.length} characters from a pool of ${r.pool}`),
    line(""),
    line(s("time to crack it", "yellow")),
    ...(
      [
        ["online", 10, "a website that allows 10 tries a second"],
        ["offline", 1e4, "a stolen database, hashed properly (bcrypt)"],
        ["worst case", 1e10, "a stolen fast hash, on a rack of GPUs"],
      ] as const
    ).map(([k, rate, how]) => line(s(`  ${k}`.padEnd(14), "green"), s(`${duration(guesses / rate).padEnd(24)}  `, "fg"), s(how, "muted"))),
    ...(noticed.length ? [line(""), line(s("noticed", "yellow")), ...noticed.map((n) => line(s("  • ", "magenta"), n))] : []),
    ...(tips.length ? [line(""), line(s("tips", "yellow")), ...tips.map((t) => line(s("  • ", "magenta"), t))] : []),
    line(""),
    line(s("checked by Rust in this tab. your password never left your computer. ", "muted"), s("pwgen", "green", { cmd: "pwgen" }), s(" makes a strong one.", "muted")),
  ];
}

// ------------------------------------------------------------------ device

interface Device {
  os: string;
  kernel: string;
  browser: string;
  arch: string | null;
  cores: number | null;
  memory: number | null;
  gpu: string | null;
  screen: string;
  window: string;
  colorDepth: number;
  dpr: number;
  theme: string;
  timezone: string;
  languages: string;
  touch: number;
  connection: string | null;
  battery: string | null;
  cookies: boolean;
  gpc: boolean;
  dnt: boolean;
  online: boolean;
}

export function parseUA(ua: string): { os: string; kernel: string; browser: string } {
  const v = (re: RegExp) => ua.match(re)?.[1];
  let os = "unknown OS";
  let kernel = "Unknown";
  if (/iPhone|iPad|iPod/.test(ua)) [os, kernel] = [`iOS ${v(/OS (\d+[_.]\d+)/)?.replace("_", ".") ?? ""}`.trim(), "Darwin"];
  else if (/Android/.test(ua)) [os, kernel] = [`Android ${v(/Android ([\d.]+)/) ?? ""}`.trim(), "Linux"];
  else if (/Mac OS X|Macintosh/.test(ua)) [os, kernel] = ["macOS", "Darwin"];
  else if (/Windows/.test(ua)) [os, kernel] = ["Windows", "Windows_NT"];
  else if (/CrOS/.test(ua)) [os, kernel] = ["ChromeOS", "Linux"];
  else if (/Linux/.test(ua)) [os, kernel] = ["Linux", "Linux"];
  let browser = "unknown browser";
  if (/Edg\//.test(ua)) browser = `Edge ${v(/Edg\/(\d+)/)}`;
  else if (/OPR\//.test(ua)) browser = `Opera ${v(/OPR\/(\d+)/)}`;
  else if (/Firefox\//.test(ua)) browser = `Firefox ${v(/Firefox\/(\d+)/)}`;
  else if (/Chrome\//.test(ua)) browser = `Chrome ${v(/Chrome\/(\d+)/)}`;
  else if (/Safari\//.test(ua)) browser = `Safari ${v(/Version\/([\d.]+)/) ?? ""}`.trim();
  return { os, kernel, browser };
}

function gpu(): string | null {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl") as WebGLRenderingContext | null;
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return String(name).replace(/^ANGLE \((.+)\)$/, "$1");
  } catch {
    return null;
  }
}

async function device(): Promise<Device> {
  type Nav = Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string; downlink?: number; rtt?: number };
    getBattery?: () => Promise<{ level: number; charging: boolean }>;
    globalPrivacyControl?: boolean;
    userAgentData?: { getHighEntropyValues?: (h: string[]) => Promise<{ architecture?: string; bitness?: string; platformVersion?: string }> };
  };
  const nav = navigator as Nav;
  const { os, kernel, browser } = parseUA(nav.userAgent);
  let battery: string | null = null;
  try {
    const b = await nav.getBattery?.();
    if (b) battery = `${Math.round(b.level * 100)}%${b.charging ? ", charging" : ""}`;
  } catch {}
  let arch: string | null = null;
  try {
    const h = await nav.userAgentData?.getHighEntropyValues?.(["architecture", "bitness"]);
    if (h?.architecture) arch = `${h.architecture}${h.bitness ? `-${h.bitness}` : ""}`;
  } catch {}
  const c = nav.connection;
  return {
    os,
    kernel,
    browser,
    arch,
    cores: nav.hardwareConcurrency || null,
    memory: nav.deviceMemory ?? null,
    gpu: gpu(),
    screen: `${screen.width}×${screen.height}`,
    window: `${innerWidth}×${innerHeight}`,
    colorDepth: screen.colorDepth,
    dpr: devicePixelRatio,
    theme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    languages: (nav.languages ?? [nav.language]).join(", "),
    touch: nav.maxTouchPoints ?? 0,
    connection: c?.effectiveType ? `${c.effectiveType}${c.downlink ? `, ~${c.downlink} Mbps` : ""}${c.rtt ? `, ${c.rtt} ms rtt` : ""}` : null,
    battery,
    cookies: nav.cookieEnabled,
    gpc: nav.globalPrivacyControl === true,
    dnt: nav.doNotTrack === "1",
    online: nav.onLine,
  };
}

/** Draws text, an emoji and a gradient; tiny rendering differences between machines change the pixels. */
function canvasPixels(): string {
  try {
    const c = document.createElement("canvas");
    c.width = 240;
    c.height = 60;
    const g = c.getContext("2d");
    if (!g) return "";
    const grad = g.createLinearGradient(0, 0, 240, 0);
    grad.addColorStop(0, "#f60");
    grad.addColorStop(1, "#06f");
    g.fillStyle = grad;
    g.fillRect(0, 0, 240, 60);
    g.font = "18px Arial, sans-serif";
    g.fillStyle = "rgba(255,255,255,0.8)";
    g.fillText("runyan.sh 🦀 ƒingerprint", 6, 36);
    g.globalCompositeOperation = "multiply";
    g.fillStyle = "rgb(0,255,255)";
    g.beginPath();
    g.arc(200, 30, 22, 0, Math.PI * 2);
    g.fill();
    return c.toDataURL();
  } catch {
    return "";
  }
}

// ------------------------------------------------------------------ commands

const PASSPHRASE_MIN = 4;

export const tools: Record<string, Command> = {
  pwcheck: {
    usage: "pwcheck",
    summary: "how long would your password take to crack?",
    group: "tools",
    secret: true,
    run: (args, ctx) => {
      const check = (pw: string): CommandResult =>
        pw
          ? {
              blocks: [note("checking…")],
              async: async () => passwordReport(await kitOf(ctx), pw),
            }
          : err("pwcheck: nothing to check");
      if (args.length) return check(args.join(" "));
      return {
        blocks: [note("type a password. it won't show on screen or be saved, and it never leaves this tab.")],
        ask: { label: "password:", then: check },
      };
    },
  },

  pwgen: {
    usage: "pwgen [length] [-n]",
    summary: "make strong random passwords (-n: no symbols)",
    group: "tools",
    run: (args, ctx) => {
      const symbols = !args.includes("-n");
      const n = Number(args.find((a) => /^\d+$/.test(a)) ?? 20);
      if (n < 8 || n > 128) return err("pwgen: length must be between 8 and 128");
      const pool = symbols ? 75 : 62;
      return {
        blocks: [note("generating…")],
        async: async () => {
          const kit = await kitOf(ctx);
          const rnd = randomOf(ctx);
          const out: Block[] = [];
          for (let i = 0; i < 4; i++) {
            const pw = kit.pwgen(rnd(n * 2 + 64), n, symbols);
            out.push(line(s(pw, "yellow", { copy: pw }), "  ", s("copy", "cyan", { copy: pw })));
          }
          return [
            ...out,
            line(""),
            note(`${n} characters from ${pool} symbols = ${Math.floor(n * Math.log2(pool))} bits each. every character is equally likely:`),
            note("Rust throws out random bytes that would favour some letters over others (rejection sampling)."),
            note("made from your browser's crypto.getRandomValues. nothing was sent anywhere."),
          ];
        },
      };
    },
  },

  encrypt: {
    usage: "encrypt <message>",
    summary: "lock a message with a passphrase",
    group: "tools",
    secret: true,
    run: (args, ctx) => {
      const message = args.join(" ");
      if (!message) return err('usage: encrypt <message>   (try: encrypt "meet me at noon")');
      return {
        blocks: [note("pick a passphrase. you'll need it to decrypt.")],
        ask: {
          label: "passphrase:",
          then: (pass) => {
            if (pass.length < PASSPHRASE_MIN) return err(`encrypt: use at least ${PASSPHRASE_MIN} characters`);
            return {
              blocks: [],
              ask: {
                label: "again:",
                then: (again) => {
                  if (again !== pass) return err("encrypt: passphrases didn't match");
                  return {
                    blocks: [note(`stretching your passphrase into a key (${fmt.format(ITERATIONS)} rounds of PBKDF2)…`)],
                    async: async () => {
                      const kit = await kitOf(ctx);
                      await breathe();
                      const t0 = performance.now();
                      const blob = toBase64Url(kit.encrypt(pass, message, randomOf(ctx)(RANDOM_BYTES)));
                      const ms = Math.round(performance.now() - t0);
                      return [
                        line(s(blob, "yellow", { copy: blob })),
                        line(""),
                        line(s("copy", "cyan", { copy: blob }), s("  ·  ", "muted"), s("decrypt it", "green", { cmd: `decrypt ${blob}` })),
                        line(""),
                        note(`ChaCha20 encryption + HMAC-SHA256 seal, key from ${fmt.format(ITERATIONS)} rounds of PBKDF2 (${ms} ms). all of it`),
                        note("written from the specs in Rust, running in this tab. send the text to anyone; only the passphrase opens it."),
                      ];
                    },
                  };
                },
              },
            };
          },
        },
      };
    },
  },

  decrypt: {
    usage: "decrypt <text>",
    summary: "open a message from encrypt",
    group: "tools",
    run: (args, ctx) => {
      if (!args.length) return err("usage: decrypt <text from encrypt>");
      const blob = fromBase64Url(args.join(""));
      if (!blob) return err("decrypt: that isn't text from encrypt");
      return {
        blocks: [],
        ask: {
          label: "passphrase:",
          then: (pass) => ({
            blocks: [note("deriving the key…")],
            async: async () => {
              const kit = await kitOf(ctx);
              await breathe();
              const r = kit.decrypt(pass, blob);
              if (r.ok) return [line(s(r.text, "bold")), line(""), note("the seal checked out: this is exactly what was encrypted.")];
              if (r.reason === "malformed") return [line(s("decrypt: that isn't text from encrypt (or it got cut off)", "red"))];
              return [
                line(s("decrypt: wrong passphrase, or the message was changed", "red")),
                note("the HMAC seal didn't match, so nothing was decrypted."),
              ];
            },
          }),
        },
      };
    },
  },

  hash: {
    usage: "hash <text>",
    summary: "SHA-256 fingerprint of any text",
    group: "tools",
    run: (args, ctx) => {
      const text = args.join(" ");
      if (!text) return err('usage: hash <text>   (try: hash "hello")');
      return {
        blocks: [note("hashing…")],
        async: async () => {
          const kit = await kitOf(ctx);
          const ours = toHex(kit.sha256(text));
          const tweaked = text.slice(0, -1) + String.fromCharCode(text.charCodeAt(text.length - 1) ^ 1);
          const out: Block[] = [row("sha256", s(ours, "yellow", { copy: ours }), 10)];
          if (typeof crypto !== "undefined" && crypto.subtle) {
            try {
              const theirs = toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))));
              out.push(row("check", theirs === ours ? s("✓ matches your browser's built-in SHA-256", "green") : s("✗ doesn't match the browser", "red"), 10));
            } catch {}
          }
          out.push(
            line(""),
            note(`change one character ("${tweaked}") and the whole thing changes:`),
            row("", s(toHex(kit.sha256(tweaked)), "muted"), 10),
            line(""),
            note("SHA-256 written from the spec in Rust. sites store hashes like this instead of your password."),
          );
          return out;
        },
      };
    },
  },

  sysinfo: {
    usage: "sysinfo",
    summary: "what your browser says about your computer",
    group: "tools",
    run: () => ({
      blocks: [note("reading your device…")],
      async: async () => {
        if (!hasWindow()) return [line(s("sysinfo: needs a browser", "red"))];
        const d = await device();
        const yes = (b: boolean) => (b ? "on" : "off");
        return [
          row("os", `${d.os}${d.arch ? ` (${d.arch})` : ""}`),
          row("browser", d.browser),
          row("cpu", d.cores ? `${d.cores} cores` : null),
          row("memory", d.memory ? `${d.memory} GB or more` : null),
          row("gpu", d.gpu),
          row("screen", `${d.screen} at ${d.dpr}x, ${d.colorDepth}-bit color`),
          row("window", d.window),
          row("theme", `${d.theme} mode`),
          row("battery", d.battery),
          row("network", d.connection ? `${d.connection}${d.online ? "" : " (offline)"}` : d.online ? "online" : "offline"),
          row("timezone", d.timezone),
          row("languages", d.languages),
          row("touch", d.touch ? `${d.touch} touch points` : "no touchscreen"),
          row("privacy", `cookies ${yes(d.cookies)} · do-not-track ${yes(d.dnt)} · global privacy control ${yes(d.gpc)}`),
          line(""),
          line(
            s("any website can read all of this without asking. ", "muted"),
            s("fingerprint", "green", { cmd: "fingerprint" }),
            s(" shows how unique it makes you; ", "muted"),
            s("ip", "green", { cmd: "ip" }),
            s(" shows where you are.", "muted"),
          ),
        ];
      },
    }),
  },

  uname: {
    usage: "uname [-a]",
    summary: "",
    group: "tools",
    hidden: true,
    run: (args) => {
      if (!hasWindow()) return { blocks: [line("Darwin")] };
      const { kernel, os, browser } = parseUA(navigator.userAgent);
      if (!args.includes("-a")) return { blocks: [line(kernel)] };
      return { blocks: [line(`${kernel} guest ${os} ${browser} ${navigator.hardwareConcurrency ?? "?"}-core`), note("(that's your machine. try sysinfo for more)")] };
    },
  },

  fingerprint: {
    usage: "fingerprint",
    summary: "how sites track you without cookies",
    group: "tools",
    run: (_a, ctx) => ({
      blocks: [note("fingerprinting your browser…")],
      async: async () => {
        if (!hasWindow()) return [line(s("fingerprint: needs a browser", "red"))];
        const kit = await kitOf(ctx);
        const d = await device();
        const short = (v: string) => toHex(kit.sha256(v)).slice(0, 8);
        const traits: [string, string][] = [
          ["browser", navigator.userAgent],
          ["screen", `${d.screen} ${d.dpr}x ${d.colorDepth}bit`],
          ["gpu", d.gpu ?? ""],
          ["hardware", `${d.cores} cores ${d.memory ?? "?"}GB ${d.touch} touch`],
          ["timezone", d.timezone],
          ["languages", d.languages],
          ["canvas", canvasPixels()],
        ];
        const id = toHex(kit.sha256(traits.map(([k, v]) => `${k}=${v}`).join("\n"))).slice(0, 20);
        const pretty = id.match(/.{1,5}/g)!.join("-");
        return [
          line(s("your fingerprint  ", "green"), s(pretty, "bold")),
          line(""),
          ...traits.map(([k, v]) =>
            line(s(`  ${k}`.padEnd(13), "green"), s(short(v), "yellow"), s(`  ${k === "canvas" ? "how your machine draws one test image" : v || "(not shared)"}`.slice(0, 90), "muted")),
          ),
          line(""),
          note("each trait is common on its own. together they're often unique to you, and this ID stays the"),
          note("same in incognito and after you clear cookies. ad networks do exactly this."),
          note("(computed here with Rust's SHA-256. I don't store it or send it anywhere.)"),
        ];
      },
    }),
  },

  ping: {
    usage: "ping [count]",
    summary: "time a round trip to my server",
    group: "tools",
    run: (args) => {
      const count = Math.min(Math.max(Number(args[0]) || 5, 1), 20);
      return {
        blocks: [line(`PING ${hasWindow() ? location.host : "runyan"}: ${count} round trips`)],
        async: async (update) => {
          const head = line(`PING ${location.host}: ${count} round trips`);
          const lines: Block[] = [];
          const times: number[] = [];
          for (let i = 0; i < count; i++) {
            const t0 = performance.now();
            let ok = true;
            try {
              const r = await fetch(`/api/net?ping=${Date.now()}`, { method: "HEAD", cache: "no-store" });
              ok = r.ok;
            } catch {
              ok = false;
            }
            const ms = performance.now() - t0;
            if (ok) times.push(ms);
            lines.push(ok ? line(`reply from ${location.host}: seq=${i + 1} time=${ms.toFixed(1)} ms`) : line(s(`request seq=${i + 1} failed`, "red")));
            update([head, ...lines]);
            if (i < count - 1) await new Promise((r) => setTimeout(r, 300));
          }
          const loss = Math.round(((count - times.length) / count) * 100);
          const out = [head, ...lines, line(""), line(s(`--- ${count} sent, ${times.length} received, ${loss}% loss ---`, "muted"))];
          if (times.length) {
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            const jitter = times.length > 1 ? times.slice(1).reduce((a, t, i) => a + Math.abs(t - times[i]), 0) / (times.length - 1) : 0;
            out.push(line(s(`min ${Math.min(...times).toFixed(1)} · avg ${avg.toFixed(1)} · max ${Math.max(...times).toFixed(1)} · jitter ${jitter.toFixed(1)} ms`, "fg")));
          }
          return out;
        },
      };
    },
  },

  flock: {
    usage: "flock [birds]",
    summary: "a Rust flock you can push around",
    group: "tools",
    run: (args) => {
      const n = Math.min(Math.max(Number(args[0]) || 1500, 50), 8000);
      return {
        blocks: [
          { kind: "widget", widget: "flock", birds: n },
          note(`${fmt.format(n)} birds, each following 3 rules (don't crowd, match heading, stay close). nobody leads.`),
          note("simulated in Rust/WebAssembly every frame. hover to push them away, hold to pull them in."),
        ],
      };
    },
  },
};
