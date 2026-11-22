// Side projects. Each one gets a card on /about and a file in ~/projects/
// in the terminal.
//
// To add one:
//   1. Copy an entry below and change it. `oneLiner` is the simple version,
//      `howItWorks` is the technical breakdown.
//   2. (Optional) add a screenshot: put the URL in `links.live`/`links.play`,
//      run `npm run shots`, and set `shot: "/shots/<id>.jpg"`.
// Only set `links.code` for public repos. Private ones show "Private repo".

import { val } from "./companies";
import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: "val",
    name: "VAL",
    kind: "AI",
    year: "2026",
    featured: true,
    oneLiner: "Our product at Future 42: AI agents that coach auto repair shop crews, grade every call and help the shop hit its numbers.",
    howItWorks: val.howItWorks,
    stack: val.stack,
    links: { live: val.url },
    shot: "/shots/val.jpg",
  },
  {
    id: "iron-horizon",
    name: "Iron Horizon",
    kind: "Game",
    year: "2026",
    featured: true,
    oneLiner:
      "A first-person shooter that runs right in your browser. Hold an outpost against waves of enemies, solo or with friends.",
    howItWorks: [
      "Three.js game engine, lazy-loaded only on the play page so the rest of the site stays light. A bundle check fails the build if three.js leaks into another route.",
      "AI soldiers with sculpted bodies, realistic kit and IK weapon handling; Survival mode with escalating waves, armories and squad revives.",
      "Co-op over Supabase Realtime: private broadcast and presence channels per party code, locked down with row-level security.",
      "Accounts, stats, loadouts and match history in Supabase Postgres with RLS. Plays on phones too, with adaptive graphics quality.",
      "The game rules (waves, vitals, economy, navigation) are pure TypeScript, tested headlessly in Node with no browser.",
    ],
    stack: ["Next.js 16", "TypeScript", "Three.js", "Supabase", "Realtime", "Tailwind v4"],
    links: { play: "https://tgf1.vercel.app", code: "https://github.com/dmoney25632/tgf" },
    shot: "/shots/tgf.jpg",
  },
  {
    id: "kit",
    name: "Rust in the terminal",
    kind: "Rust",
    year: "2026",
    featured: true,
    oneLiner: "The terminal on this site runs real Rust on your computer: encrypt a message, test a password, see what your browser gives away, or push a flock of birds around.",
    howItWorks: [
      "One dependency-free Rust crate compiled to a ~70 KB WebAssembly module with zero imports: it can't touch the network or the page.",
      "SHA-256, HMAC, PBKDF2 and ChaCha20 written from the specs; `encrypt` seals messages encrypt-then-MAC, so a wrong passphrase or one flipped bit is caught.",
      "A zxcvbn-style password meter that counts guesses (leaked lists, l33t words, keyboard runs, years) instead of ticking boxes, plus an unbiased generator.",
      "A boids flock with an O(n) grid neighbour search; JS reads positions straight out of WebAssembly memory every frame.",
      "Tested twice: cargo test against RFC/NIST vectors, and Vitest checks the compiled .wasm against Node's own crypto.",
    ],
    stack: ["Rust", "WebAssembly", "Cryptography", "Canvas 2D", "TypeScript"],
    links: { play: "/?run=flock", code: "https://github.com/dmoney25632/me/tree/main/rust/kit" },
    shot: "/shots/kit.jpg",
  },
  {
    id: "evrcad",
    name: "Evrcad",
    kind: "SaaS",
    year: "2026",
    featured: true,
    oneLiner: "A HIPAA-compliant platform Medicare insurance agencies use to manage their clients.",
    logo: "/logos/evrcad.png",
    color: "#1a5fa8",
    links: {},
  },
  {
    id: "model-clash",
    name: "Model Clash",
    kind: "AI",
    year: "2026",
    featured: true,
    oneLiner: "Ask a hard question and watch GPT, Claude, Grok and Gemini debate it, live, round by round.",
    howItWorks: [
      "One /api/debate route fronts four providers (Grok via an OpenAI-compatible endpoint). Every model sees the full transcript, and speaking order is shuffled each round.",
      "Answers stream to the browser over server-sent events, with a hard word cap enforced mid-stream.",
      "Share links gzip the whole debate in the browser into the URL itself, so nothing is stored on a server. Markdown and JSON export too.",
      "Bring-your-own API keys stay in your browser and are never logged. Provider errors turn into plain messages.",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind", "OpenAI", "Anthropic", "Gemini", "Grok", "SSE"],
    links: {
      live: "https://thetruthcomesout.vercel.app",
      code: "https://github.com/dmoney25632/thetruthcomesout",
    },
    shot: "/shots/model-clash.jpg",
  },
];

/** The game people can play from the site (`play` in the terminal). */
export const game = projects.find((p) => p.id === "iron-horizon")!;
