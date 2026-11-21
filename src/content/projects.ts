// Side projects. Each one gets a card on /about and a file in ~/projects/
// in the terminal.
//
// To add one:
//   1. Copy an entry below and change it. `oneLiner` is the simple version,
//      `howItWorks` is the technical breakdown.
//   2. (Optional) add a screenshot: put the URL in `links.live`/`links.play`,
//      run `npm run shots`, and set `shot: "/shots/<id>.jpg"`.
// Only set `links.code` for public repos. Private ones show "Private repo".

import type { Project } from "./types";

export const projects: Project[] = [
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
    id: "flock",
    name: "Flock",
    kind: "Rust",
    year: "2026",
    featured: true,
    oneLiner: "Thousands of birds flocking live in your browser. Push them around with your cursor.",
    howItWorks: [
      "Boids simulation written in Rust with no dependencies, compiled to a ~36 KB WebAssembly module.",
      "Uniform-grid neighbour search keeps each step roughly O(n), so thousands of birds hold 60 fps.",
      "JavaScript reads positions straight out of WebAssembly memory every frame and draws them on a canvas.",
      "Headless physics tests in Rust (cargo test) check bounds, speed limits and that a random crowd becomes a flock.",
    ],
    stack: ["Rust", "WebAssembly", "Canvas 2D", "TypeScript"],
    links: { play: "/lab", code: "https://github.com/dmoney25632/me/tree/main/rust/flock" },
    shot: "/shots/flock.jpg",
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
    tag: "Insurance",
    badge: "HIPAA-compliant",
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
  {
    id: "sentinelview",
    name: "SentinelView",
    kind: "Data",
    year: "2026",
    oneLiner: "Watches live flight, ship and conflict data and flags anything that looks suspicious on a map.",
    howItWorks: [
      "Pulls OpenSky (flights), AISHub (ships), ACLED (conflict events) and NOAA (weather), with a mock-data mode that runs fully offline.",
      "Computes speed, heading changes, loitering, position jumps and descent rates for every track.",
      "Scores anomalies by blending an Isolation Forest model with hand-written rules for dark vessels, spoofed speeds and sharp turns.",
      "Claude on AWS Bedrock writes a short intel brief for each flagged track. FastAPI serves heat maps and a JSON API. 65 tests.",
    ],
    stack: ["Python", "FastAPI", "pandas", "scikit-learn", "LangChain", "AWS Bedrock", "Folium"],
    links: { code: "https://github.com/dmoney25632/sentinelview" },
  },
  {
    id: "dynasty",
    name: "The Dynasty Group",
    kind: "Web",
    year: "2026",
    oneLiner: "Website for an independent health insurance agency, built to follow Medicare marketing rules.",
    howItWorks: [
      "Every business detail and the required Medicare marketing disclaimer come from one config file.",
      "Route groups split the main site from a recruiting funnel; data-driven team page and a mobile call bar.",
      "Business-texting (A2P 10DLC) opt-in form posts to a validating API route that records consent.",
    ],
    stack: ["Next.js 16", "React 19", "React Compiler", "TypeScript", "Tailwind v4"],
    links: { live: "https://dynastygroup.vercel.app" },
    shot: "/shots/dynasty.jpg",
  },
  {
    id: "crypto-wallet",
    name: "Crypto Wallet Manager",
    kind: "Web3",
    year: "2026",
    oneLiner: "Connect your MetaMask wallet and see your ETH balance, ENS name and recent transactions.",
    howItWorks: [
      "Connects MetaMask through the standard wallet API (EIP-1193), reads the balance with ethers and resolves the ENS name.",
      "Pulls the 20 most recent transactions from Etherscan with hash, date, from/to, value and status.",
      "GitHub Actions builds and deploys the app on every push.",
    ],
    stack: ["React 19", "Vite", "ethers.js v6", "Etherscan API", "GitHub Actions"],
    links: {},
  },
  {
    id: "wordle",
    name: "Wordle Clone",
    kind: "Game",
    year: "2026",
    oneLiner: "A full desktop Wordle, written in Python.",
    howItWorks: [
      "Full game loop: 6×5 grid, clickable on-screen keyboard plus physical keys, messages and restart.",
      "Two-pass scoring so repeated letters are marked green or yellow correctly.",
      "527 possible answers, with guesses checked against a 639-word allowed list.",
    ],
    stack: ["Python", "Pygame"],
    links: { code: "https://github.com/dmoney25632/Wordle-Copia" },
  },
];

/** The game people can play from the site (`play` in the terminal). */
export const game = projects.find((p) => p.id === "iron-horizon")!;
