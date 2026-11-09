// All site content lives here. Add a project by appending to `projects`.

export interface Project {
  id: string;
  title: string;
  /** Shown on the right, e.g. "2026 — Present" or "2020 — 2023". */
  period: string;
  /** Short label, e.g. "SaaS", "AI", "Research". */
  kind: string;
  description: string;
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
  status: "Currently building Evrcad",
  tagline:
    "21-year-old building profitable SaaS & AI tools that solve real problems.",
  intro:
    "I build software for problems I've run into myself — from scheduling tools for my first cleaning business to a SaaS platform for Medicare agencies. Lately I'm deep into AI tooling, trading research, and anything that turns messy operations into clean systems.",
  email: "dayton@evrcad.com",
  location: "Utah County, Utah",
  socials: {
    github: "https://github.com/dmoney25632",
    twitter: "https://x.com/daytonrunyan",
    linkedin: "https://linkedin.com/in/daytonrunyan",
  },
};

export const experience: Experience[] = [
  {
    company: "Evrcad",
    role: "Founder",
    period: "2026 — Now",
    location: "Utah County, UT",
    description:
      "Founded and architected Evrcad Insurance, a SaaS platform for Medicare insurance agencies. Built the full-stack product handling client management, compliance workflows, and performance analytics.",
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
    id: "evrcad",
    kind: "SaaS",
    featured: true,
    title: "Evrcad Insurance",
    period: "2026 — Present",
    description:
      "SaaS platform for Medicare insurance agencies. Client management, CMS compliance workflows, and agent performance analytics in one place — replacing spreadsheets and legacy tools.",
    tech: ["Next.js", "TypeScript", "Supabase", "Python", "Vercel"],
    liveUrl: "https://evrcad.com",
  },
  {
    id: "cryptommm",
    kind: "Research",
    title: "cryptommm",
    period: "2026",
    description:
      "Market-microstructure research on Hyperliquid's wallet-attributed order flow: do groups of wallets trade together, and do some wallets place orders they never intend to fill? A separate Coinbase trading bot reads the research read-only and can only ever be made more cautious by it.",
    tech: ["Python", "Hyperliquid", "Coinbase API"],
  },
  {
    id: "model-clash",
    kind: "AI",
    featured: true,
    title: "Model Clash",
    period: "2026",
    description:
      "AI debate arena. Pit OpenAI, Claude, Grok, and Gemini against each other in multi-round debates — speaking order is shuffled and each model sees the full transcript. API keys never leave your browser.",
    tech: ["Next.js", "TypeScript", "OpenAI", "Claude", "Grok", "Gemini"],
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
    tech: ["Python", "FastAPI", "scikit-learn", "AWS Bedrock"],
    githubUrl: "https://github.com/dmoney25632/sentinelview",
  },
  {
    id: "corva",
    kind: "Website",
    title: "Corva Insurance",
    period: "2026",
    description:
      "Website for Corva Insurance Group, a Medicare agency I co-founded serving Arizona and Utah. Built to be accessible and to follow CMS marketing rules.",
    tech: ["Next.js", "TypeScript", "Tailwind", "Supabase"],
    liveUrl: "https://corva-insurance.vercel.app",
  },
  {
    id: "dynasty",
    kind: "Website",
    title: "The Dynasty Group",
    period: "2026",
    description:
      "CMS-compliant website for an independent licensed health insurance agency, wired into the Evrcad agent portal.",
    tech: ["Next.js", "TypeScript"],
    liveUrl: "https://dynastygroup.vercel.app",
  },
  {
    id: "crypto-wallet",
    kind: "Web3",
    title: "Crypto Wallet Manager",
    period: "2026",
    description:
      "Connect MetaMask to see your ETH balance, ENS name, and recent transaction history pulled from Etherscan.",
    tech: ["JavaScript", "ethers.js", "Etherscan API"],
    liveUrl: "https://dmoney25632.github.io/Crypto/",
    githubUrl: "https://github.com/dmoney25632/Crypto",
  },
  {
    id: "wordle",
    kind: "Game",
    title: "Wordle Clone",
    period: "2026",
    description:
      "Fully playable Wordle in Python — on-screen keyboard, proper duplicate-letter handling, and a fresh random word every run.",
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
    tech: ["Small business", "Operations", "TypeScript"],
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

export const navLinks = [
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
] as const;
