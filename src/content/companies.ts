// Companies I've started. Each one gets a big card on /about and a file in
// ~/companies/ in the terminal. To add one, copy an entry and change it.
// Future 42's product, VAL, has its own section below the list.

import type { Company } from "./types";

export const companies: Company[] = [
  {
    id: "future42",
    name: "Future 42",
    role: "Co-founder & SWE",
    period: "2026 — Now",
    url: "https://ftr42.com",
    oneLiner: "An AI company. We build VAL, software that runs auto repair shops.",
    story:
      "Future 42 designs, builds and runs AI systems for real businesses. Our main product is VAL, which lives inside tire and auto shops: it reads the day's numbers, grades the calls, runs the time clock and coaches the crew. It's running live in real stores.",
    highlights: [
      "Building VAL end to end: owner console, crew phone app, call grading and nightly coaching.",
      "Running it live in real tire and auto shops, in English and Spanish.",
    ],
    shot: "/shots/future42.jpg",
  },
  {
    id: "corva",
    name: "Corva Insurance Group",
    role: "Co-founder & agent",
    period: "2025 — Now",
    url: "https://corvainsurance.com",
    oneLiner: "A Medicare agency that helps people pick the right plan, without the call-center pressure.",
    story:
      "I co-founded Corva, an independent Medicare agency based in Arizona and Utah. Licensed agents sit down with people, compare plans across carriers at no cost, and follow CMS rules to the letter. I work with 100+ clients myself, built our compliance and client-management workflows (zero compliance violations), and built the website.",
    highlights: [
      "Multi-step \"find your plan\" wizard with per-step validation that hands off to scheduling.",
      "Lead, careers and SMS opt-in forms validated with Zod, with per-field errors and email alerts over SMTP.",
      "Agent recruiting flow, SMS consent pages, legal pages, sitemap and robots, all built to CMS marketing rules.",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind", "Framer Motion", "Zod", "Nodemailer"],
    shot: "/shots/corva.jpg",
  },
  {
    id: "rags",
    name: "Rags Cleaning",
    role: "Founder",
    period: "2020 — 2023",
    url: "https://www.ragscleaning.com",
    oneLiner: "Commercial and residential window cleaning from Ogden to Provo. My first business.",
    story:
      "Rags Cleaning was the first company I started. I built and ran the whole thing, from scheduling and invoicing to the marketing that brought in work. It grew into a profitable business serving commercial and government clients, doing $40k+ a year.",
    highlights: [
      "Ran operations: custom scheduling and invoicing, plus the marketing funnels that brought in work.",
      "Website: statically generated pages for every service, guide and 12 city landing pages for local SEO.",
      "Per-page social images and rich structured data (FAQ, articles, offers, service areas), a sitemap and a web manifest.",
      "A Flappy-style arcade game built on Canvas 2D, split into physics, render and audio modules.",
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind v4", "Framer Motion", "next/og"],
    shot: "/shots/rags.jpg",
  },
];

/** VAL, Future 42's product. Gets its own dark section on /about. */
export const val = {
  name: "VAL",
  company: "Future 42",
  url: "https://valspark.ai",
  tagline: "AI agents for auto repair shops.",
  description:
    "VAL runs inside a tire and auto shop. It reads the end-of-day report, knows the goals, grades the calls, and coaches the crew in English and Spanish. It doesn't wait for someone to open a dashboard: it texts the owner what slipped yesterday and what to do about it.",
  pillars: [
    {
      title: "It sees the numbers",
      body: 'Ask "how am I doing vs goal?" and get dollars to go, attach rate, and margin. Not a pep talk.',
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
  howItWorks: [
    "Call grading: Claude Haiku on AWS Bedrock scores call transcripts against a versioned rubric, with the rubric prompt-cached to keep cost down.",
    "Nightly call attribution: parallel per-call extraction feeds one cross-call reasoner, and code guardrails (roster checks, caps, human overrides) decide what's saved, never the model alone.",
    "GPS time clock: punches are checked against a geofence plus the shop's own network, with offline-queued punches and flags for late or off-site clock-outs that feed payroll.",
    "Photo-proof tasks: an AI pass/fail/borderline verdict, manager approval, and a points bonus for good photos.",
    "Edge speech-to-text on an NVIDIA Jetson (faster-whisper behind FastAPI), and an MCP server whose writes need human approval.",
    "Multi-tenant Supabase Postgres with row-level security and pgvector, Vercel crons, staged deploys through GitHub Actions, and hundreds of tests plus AI eval suites.",
  ],
  stack: ["Next.js", "TypeScript", "Expo / React Native", "Supabase", "Claude", "AWS", "FastAPI", "NVIDIA Jetson"],
};
