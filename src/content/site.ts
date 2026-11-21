// All site content lives here. The terminal's filesystem (src/content/filesystem.ts)
// is built from these lists, so adding a project here adds ~/projects/<id>.md.

export interface Project {
  id: string;
  title: string;
  /** Shown on the right, e.g. "2026 — Present" or "2020 — 2023". */
  period: string;
  /** Short label, e.g. "SaaS", "AI", "Research". */
  kind: string;
  description: string;
  /** Technical breakdown: what I actually built, one bullet each. */
  built?: string[];
  tech: string[];
  /** Featured projects show as big cards at the top. */
  featured?: boolean;
  liveUrl?: string;
  /** Only set for public repos — private ones 404 for visitors. */
  githubUrl?: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
}

export interface EducationItem {
  school: string;
  detail: string;
  period: string;
  type: "school" | "cert";
}

export const siteConfig = {
  name: "Dayton Runyan",
  title: "Founder & Builder",
  status: "Building VAL at Future 42",
  tagline:
    "Building VAL at Future 42 — AI agents that help auto repair shops coach their crew and hit their numbers.",
  intro:
    "Most of my time goes into Future 42, where we're building VAL: an AI that lives inside the shop, reads the day's numbers, and tells the crew what to do about them before anyone asks. Before that I built software for Medicare agencies, a cleaning company, and whatever else needed fixing.",
  location: "Utah County, Utah",
  socials: {
    github: "https://github.com/dmoney25632",
    twitter: "https://x.com/daytonrunyan",
    linkedin: "https://linkedin.com/in/daytonrunyan",
  },
};

/** The main thing. Rendered as the big section at the top of the home page. */
export const future42 = {
  name: "Future 42",
  url: "https://ftr42.com",
  blurb:
    "Future 42 is an AI company. We design, build, and run AI systems for real businesses, and our main product right now is VAL.",
  product: {
    name: "VAL",
    url: "https://valspark.ai",
    tagline: "AI agents for auto repair shops.",
    description:
      "VAL runs inside a tire and auto shop. It reads the end-of-day report, knows the goals, grades the calls, and coaches the crew in English and Spanish. It doesn't wait for someone to open a dashboard: it texts the owner what slipped yesterday and what to do about it.",
    pillars: [
      {
        title: "It sees the numbers",
        body: "Ask \"how am I doing vs goal?\" and get dollars to go, attach rate, and margin — not a pep talk.",
      },
      {
        title: "It reaches out first",
        body: "Every night it reads the day and sends the one thing worth acting on tomorrow, with the play attached.",
      },
      {
        title: "It's fitted to the shop",
        body: "Your playbook, vendors, and rules. Teach it once and it answers like your best service writer.",
      },
    ],
    /** Technical breakdown of VAL. */
    built: [
      "Call grading: Claude Haiku on AWS Bedrock scores call transcripts against a versioned rubric, with the rubric prompt-cached to keep cost down.",
      "Nightly call attribution: parallel per-call extraction feeds one cross-call reasoner, and code guardrails (roster checks, caps, human overrides) decide what's saved, never the model alone.",
      "GPS time clock: punches are checked against a geofence plus the shop's own network, with offline-queued punches and flags for late or off-site clock-outs that feed payroll.",
      "Photo-proof tasks: an AI pass/fail/borderline verdict, manager approval, and a points bonus for good photos.",
      "Edge speech-to-text on an NVIDIA Jetson (faster-whisper behind FastAPI), and an MCP server whose writes need human approval.",
      "Multi-tenant Supabase Postgres with row-level security and pgvector, Vercel crons, staged deploys through GitHub Actions, and hundreds of tests plus AI eval suites.",
    ],
    stack: ["Next.js", "TypeScript", "Expo / React Native", "Supabase", "Claude (Anthropic + Bedrock)", "AWS", "FastAPI", "NVIDIA Jetson"],
    surfaces: [
      "Owner console",
      "Employee phone app",
      "Call grading",
      "GPS time clock",
      "Photo-proof tasks",
      "End-of-day ingest",
    ],
  },
};

export const experience: Experience[] = [
  {
    company: "Future 42",
    role: "Building VAL",
    period: "2026 — Now",
    location: "Utah County, UT",
    description:
      "Building VAL, an AI ecosystem for auto repair shops: the owner console, the crew's phone app, call grading, and the nightly coaching that pushes the next move before anyone asks. Running it live in real stores.",
  },
  {
    company: "Peak Senior Solutions",
    role: "Managing Partner",
    period: "2025 — 2026",
    location: "Utah, United States",
    description:
      "Built and scaled operations for a Medicare insurance agency. Designed compliance workflows and client management processes to support rapid growth while maintaining zero compliance violations.",
  },
  {
    company: "The Church of Jesus Christ of Latter-day Saints",
    role: "Missionary",
    period: "2023 — 2025",
    location: "Cali, Colombia",
    description:
      "Served full-time in Cali, Popayán, and Pasto, Colombia. Managed community relationships, became fluent in Spanish, and learned to work in a high-autonomy environment.",
  },
  {
    company: "Dixon Glass",
    role: "Manager",
    period: "2022 — 2023",
    location: "United States",
    description:
      "Managed daily operations and job-site workflows. Designed a customer management funnel, built the company website, and coordinated scheduling across concurrent projects.",
  },
];

export const projects: Project[] = [
  {
    id: "cryptommm",
    kind: "Research",
    title: "cryptommm",
    period: "2026",
    description:
      "Market-microstructure research on Hyperliquid's wallet-attributed order flow: do groups of wallets trade together, and do some wallets place orders they never intend to fill? A separate Coinbase trading bot reads the research read-only and can only ever be made more cautious by it.",
    built: [
      "Ingests wallet-attributed order placements and cancels from Hyperliquid (WebSocket, S3 archives and a local node feed) plus Coinbase L2 books into ClickHouse, Postgres and a DuckDB/Parquet lake.",
      "Spoofing detector scores size asymmetry instead of cancel rate, so normal market makers don't get flagged.",
      "Wallet-coordination clustering is tested against a null model with multiple-comparison correction; also VPIN toxicity, lead-lag and copy-trading detection.",
      "Walk-forward backtests with purge/embargo and a deflated Sharpe ratio, validated on a synthetic market with planted ground truth (and a nothing-planted control).",
      "The trader reads research read-only and can only get more cautious: volatility-targeted sizing, paper mode by default, a veto-only news loop and a file-based kill switch. 477 tests, no infra needed.",
    ],
    tech: ["Python", "Hyperliquid", "Coinbase", "ClickHouse", "DuckDB", "NetworkX", "FastAPI", "Docker"],
  },
  {
    id: "model-clash",
    kind: "AI",
    featured: true,
    title: "Model Clash",
    period: "2026",
    description:
      "AI debate arena. Pit OpenAI, Claude, Grok, and Gemini against each other in multi-round debates — speaking order is shuffled and each model sees the full transcript. API keys never leave your browser.",
    built: [
      "One /api/debate route fronts four providers (Grok via an OpenAI-compatible endpoint); every model sees the full transcript and speaking order is shuffled each round.",
      "Responses stream to the browser over server-sent events, with a hard word cap enforced mid-stream so only whole words that fit are sent.",
      "Share links gzip the whole transcript in the browser (CompressionStream) into the URL hash, so nothing is stored on a server. Markdown and JSON export too.",
      "Bring-your-own keys stay in localStorage and are never logged; provider errors (bad key, rate limit, quota, unknown model) map to clear messages.",
    ],
    tech: ["Next.js", "TypeScript", "Tailwind", "OpenAI", "Anthropic", "Gemini", "Grok", "SSE"],
    liveUrl: "https://thetruthcomesout.vercel.app",
    githubUrl: "https://github.com/dmoney25632/thetruthcomesout",
  },
  {
    id: "sentinelview",
    kind: "Data / ML",
    title: "SentinelView",
    period: "2026",
    description:
      "Real-time geospatial OSINT dashboard for maritime, airspace, and conflict monitoring, with ML anomaly detection and Claude-powered analysis.",
    built: [
      "Ingest clients for OpenSky (ADS-B flights), AISHub (ships), ACLED (conflict events) and NOAA (weather), with a mock-data mode that runs fully offline.",
      "Feature pipeline computes haversine distance, time gaps, implied speed, heading change, loitering and altitude/descent rates per track.",
      "Anomaly score blends an Isolation Forest (0.6) with a rule detector (0.4) for dark vessels, position jumps, sharp turns, speed spoofing and extreme descents.",
      "Claude on Bedrock writes intel briefs for flagged tracks; FastAPI serves Folium heat maps plus /api/anomalies and /health. 65 pytest tests.",
    ],
    tech: ["Python", "FastAPI", "pandas", "scikit-learn", "LangChain", "AWS Bedrock", "Folium", "pytest"],
    githubUrl: "https://github.com/dmoney25632/sentinelview",
  },
  {
    id: "corva",
    kind: "Website",
    title: "Corva Insurance",
    period: "2026",
    description:
      "Website for Corva Insurance Group, a Medicare agency I co-founded serving Arizona and Utah. Built to be accessible and to follow CMS marketing rules.",
    built: [
      "Multi-step lead wizard with per-step validation that hands off to a Calendly scheduling embed.",
      "API routes for leads, careers and SMS opt-in validate with Zod, return per-field errors and send email alerts over SMTP.",
      "Agent recruiting and application flow, SMS consent page and terms, legal pages, plus a dynamic sitemap and robots file.",
    ],
    tech: ["Next.js", "TypeScript", "Tailwind", "Framer Motion", "Zod", "Nodemailer"],
    liveUrl: "https://corva-insurance.vercel.app",
  },
  {
    id: "dynasty",
    kind: "Website",
    title: "The Dynasty Group",
    period: "2026",
    description:
      "CMS-compliant website for an independent licensed health insurance agency.",
    built: [
      "CMS-compliant agency site with the required third-party marketing (TPMO) disclaimer and all business details driven from one config file.",
      "Route groups split the main site from a recruiting funnel; data-driven team page and a mobile call bar.",
      "A2P 10DLC SMS opt-in form posts to a validating API route that records consent.",
    ],
    tech: ["Next.js 16", "React 19", "React Compiler", "TypeScript", "Tailwind v4"],
    liveUrl: "https://dynastygroup.vercel.app",
  },
  {
    id: "crypto-wallet",
    kind: "Web3",
    title: "Crypto Wallet Manager",
    period: "2026",
    description:
      "Connect MetaMask to see your ETH balance, ENS name, and recent transaction history pulled from Etherscan.",
    built: [
      "Connects MetaMask through window.ethereum (EIP-1193), reads the ETH balance with ethers and resolves the wallet's ENS name.",
      "Pulls the 20 most recent transactions from Etherscan with hash, date, from/to, value and status.",
      "GitHub Actions builds the app and deploys it to GitHub Pages on every push.",
    ],
    tech: ["React 19", "Vite", "ethers.js v6", "Etherscan API", "GitHub Actions"],
    liveUrl: "https://dmoney25632.github.io/Crypto/",
  },
  {
    id: "wordle",
    kind: "Game",
    title: "Wordle Clone",
    period: "2026",
    description:
      "Fully playable Wordle in Python — on-screen keyboard, proper duplicate-letter handling, and a fresh random word every run.",
    built: [
      "Full game loop: 6×5 grid, clickable on-screen keyboard plus physical keys, toast messages and restart.",
      "Two-pass scoring so repeated letters are marked green or yellow correctly.",
      "527 possible answers, with guesses validated against a 639-word allowed list.",
    ],
    tech: ["Python", "Pygame"],
    githubUrl: "https://github.com/dmoney25632/Wordle-Copia",
  },
  {
    id: "rags",
    kind: "Business",
    title: "Rags Cleaning",
    period: "2020 — 2023",
    description:
      "My first business. Built and scaled a profitable cleaning company, with custom scheduling and invoicing systems, marketing funnels, and all the tech behind it.",
    built: [
      "Statically generated SEO pages for every service, guide and 12 city-specific landing pages.",
      "Per-route Open Graph images, plus FAQPage, Article, BreadcrumbList, Offer and place structured data, a sitemap and a web manifest.",
      "A Flappy-style arcade game on Canvas 2D, split into physics, render and audio modules.",
      "Before the site: built and ran the business itself, including scheduling, invoicing and marketing funnels.",
    ],
    tech: ["Next.js 16", "React 19", "TypeScript", "Tailwind v4", "Framer Motion", "next/og"],
    liveUrl: "https://ragscleaning.vercel.app",
  },
];

export const education: EducationItem[] = [
  {
    school: "Brigham Young University",
    detail: "B.S., Information Systems",
    period: "In progress",
    type: "school",
  },
  {
    school: "CompTIA Security+",
    detail: "Certification",
    period: "Certified",
    type: "cert",
  },
];

/** ~/about.md — the short version, as bullets. */
export const about = {
  bullets: [
    "Founder. Building VAL at Future 42: AI that coaches auto repair shops.",
    "Started my first business, Rags Cleaning, in 2020 and ran it for three years.",
    "Served a two-year mission in Cali, Popayán and Pasto, Colombia. Fluent in Spanish.",
    "Studying Information Systems at BYU. CompTIA Security+ certified.",
    "Based in Utah County, Utah.",
  ],
  /** Lines under "what I care about". */
  values: [
    "Software that does the work instead of showing a dashboard about it.",
    "Shipping to real users early, then fixing what they actually hit.",
    "Small businesses: the ones that keep a town running.",
  ],
};

/** ~/now.md — what I'm doing right now. Update it whenever it changes. */
export const now = {
  updated: "2026-11-20",
  items: [
    "Running VAL live in real tire and auto shops.",
    "Building the crew's phone app and nightly coaching.",
    "Finishing my degree at BYU.",
  ],
};

/** Photos in public/photos. They show up as ~/photos/<file>. */
export const photos = [
  { file: "headshot.jpg", src: "/photos/headshot.jpg", alt: "Dayton Runyan in a navy suit", caption: "the professional one" },
  { file: "outdoors.jpg", src: "/photos/outdoors.jpg", alt: "Dayton Runyan smiling outdoors in front of a Utah valley", caption: "the real one" },
];

/** The /about page (the editorial, non-terminal version of the site). */
export const profile = {
  badge: "Founder · Future 42",
  headline: ["Building", "software", "that", "does", "the", { text: "work.", italic: true as const }],
  sub: "I'm building VAL at Future 42: AI that lives inside auto repair shops, reads the day's numbers, and tells the crew what to do next. I've been starting things since 2020.",
  portrait: { src: "/photos/outdoors.jpg", alt: "Dayton Runyan smiling outdoors in front of a Utah valley" },
  aboutPhoto: { src: "/photos/headshot.jpg", alt: "Dayton Runyan in a navy suit", caption: "Utah County · usually shipping" },
  initials: "DR",
  seal: "FOUNDER · FUTURE 42 · BYU · ",
  role: "Founder & Builder",
  est: "2020",
  marquee: ["AI agents", "Next.js", "TypeScript", "Python", "Supabase", "Data & ML", "Security+", "Español"],
  stats: [
    { value: String(projects.length), label: "projects shipped" },
    { value: "2", label: "years in Colombia" },
    { value: "2", label: "languages, fluently" },
    { value: "2020", label: "first business" },
  ],
};
