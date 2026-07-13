export type ProjectCategory = "All" | "SaaS" | "AI" | "Tools" | "Other";

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  learned: string;
  category: Exclude<ProjectCategory, "All">;
  tech: string[];
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

export interface Skill {
  name: string;
  category: "Frontend" | "Backend & Cloud" | "AI & Automation" | "Tools & Ops";
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  type?: string;
}

export const siteConfig = {
  name: "Dayton Runyan",
  monogram: "DR",
  title: "Founder & Builder",
  tagline:
    "21-year-old building profitable SaaS & AI tools that solve real problems.",
  email: "dayton@evrcad.com",
  location: "Utah County, Utah",
  socials: {
    github: "https://github.com/dmoney25632",
    twitter: "https://x.com/daytonrunyan",
    linkedin: "https://linkedin.com/in/daytonrunyan",
  },
};

export const about = {
  paragraphs: [
    "I've co-founded small businesses, led teams in both business and volunteer settings, and managed different technology infrastructures. From managing field operations and finances at a construction company to leading community outreach in Colombia, I thrive where opportunities, systems, and service intersect.",
    "Skilled in Spanish (professional working proficiency), team leadership, operations, and client management — and now actively building a foundation in computer engineering and cybersecurity.",
    "Always looking for opportunities to apply my skills in tech, operations, or project management while continuing to grow as a problem-solver and contributor.",
  ],
  highlights: [
    { label: "Founder", value: "Evrcad Insurance" },
    { label: "Studying", value: "IS @ BYU" },
    { label: "Languages", value: "English & Spanish" },
    { label: "Cert", value: "CompTIA Security+" },
  ],
};

export const experience: Experience[] = [
  {
    company: "Evrcad",
    role: "Founder",
    period: "Jan 2026 – Present",
    location: "Utah County, UT",
    type: "Enterprise Software",
    description:
      "Founded and architected Evrcad Insurance, a SaaS platform for Medicare insurance agencies. Built full-stack product handling client management, compliance workflows, and performance analytics. Generating meaningful early revenue with strong month-over-month growth.",
  },
  {
    company: "Peak Senior Solutions",
    role: "Managing Partner",
    period: "Aug 2025 – May 2026",
    location: "Utah, United States",
    description:
      "Built and scaled operations for a Medicare insurance agency. Designed compliance workflows and client management processes to support rapid growth while maintaining zero compliance violations.",
  },
  {
    company: "The Church of Jesus Christ of Latter-day Saints",
    role: "Missionary",
    period: "Aug 2023 – Jul 2025",
    location: "Cali, Colombia",
    description:
      "Served as a full-time missionary in Colombia (Cali, Popayán, Pasto). Managed community relationships, developed Spanish fluency, and built cross-cultural communication skills in a high-autonomy environment.",
  },
  {
    company: "Dixon Glass",
    role: "Manager",
    period: "Apr 2022 – Jul 2023",
    location: "United States",
    description:
      "Managed daily operations and job site workflows. Designed a customer management funnel, built the company website, and coordinated scheduling across concurrent projects.",
  },
  {
    company: "Rags Cleaning",
    role: "Founder",
    period: "Apr 2020 – Jul 2023",
    location: "Utah, United States",
    description:
      "Built and scaled a profitable service business. Implemented custom management systems for scheduling and invoicing, developed marketing funnels, and handled all technical infrastructure.",
  },
];

export const projects: Project[] = [
  {
    id: "evrcad",
    title: "Evrcad Insurance",
    description:
      "SaaS platform for Medicare agencies — clients, compliance, and analytics.",
    longDescription:
      "Evrcad is a full-stack SaaS platform built for Medicare insurance agencies. It handles client management, compliance workflows, and performance analytics in one place — replacing fragmented spreadsheets and legacy tools. Architected from the ground up with a focus on reliability, speed, and regulatory accuracy. Already generating meaningful early revenue with strong month-over-month growth.",
    learned:
      "How to ship a production SaaS end-to-end: product architecture, compliance-aware UX, and iterating based on real agency feedback while growing revenue.",
    category: "SaaS",
    tech: ["TypeScript", "Python", "Supabase", "Vercel", "Next.js"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    liveUrl: "https://evrcad.com",
    featured: true,
  },
  {
    id: "model-clash",
    title: "Model Clash",
    description:
      "Multi-round AI debates between OpenAI, Claude, Grok, and Gemini.",
    longDescription:
      "Model Clash is a Next.js web app that runs multi-round AI debates between OpenAI, Claude, Grok, and Gemini. Pick a contentious prompt, how many rounds (up to 5), and which models to include. The app shuffles speaking order and streams each model’s reply into a chat-style transcript, with later speakers seeing the full history. Models are prompted to argue and also surface their training/alignment lean. API keys stay in the browser (localStorage) and are only sent to a proxy route so the server can call providers. Includes a default demo/cheap mode, shareable URL hashes, Markdown/JSON export, and a collapsible settings UI.",
    learned:
      "Streaming multi-provider debates taught me how to orchestrate concurrent model calls, keep secrets client-side safely via a thin proxy, and design a shareable debate UX around history-aware prompting.",
    category: "AI",
    tech: ["Next.js", "TypeScript", "OpenAI", "Claude", "Grok", "Gemini"],
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    liveUrl: "https://thetruthcomesout.vercel.app",
    githubUrl: "https://github.com/dmoney25632/thetruthcomesout",
    featured: true,
  },
];

export const skills: Skill[] = [
  // Frontend
  { name: "TypeScript", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "React", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Framer Motion", category: "Frontend" },
  // Backend & Cloud
  { name: "Python", category: "Backend & Cloud" },
  { name: "Supabase", category: "Backend & Cloud" },
  { name: "PostgreSQL", category: "Backend & Cloud" },
  { name: "Vercel", category: "Backend & Cloud" },
  { name: "REST APIs", category: "Backend & Cloud" },
  // AI & Automation
  { name: "OpenAI / Gemini", category: "AI & Automation" },
  { name: "Workflow Automation", category: "AI & Automation" },
  { name: "Prompt Engineering", category: "AI & Automation" },
  { name: "Data Pipelines", category: "AI & Automation" },
  // Tools & Ops
  { name: "Git & GitHub", category: "Tools & Ops" },
  { name: "Cybersecurity", category: "Tools & Ops" },
  { name: "Operations", category: "Tools & Ops" },
  { name: "Client Management", category: "Tools & Ops" },
  { name: "Spanish (Professional)", category: "Tools & Ops" },
];

export const skillCategories = [
  "Frontend",
  "Backend & Cloud",
  "AI & Automation",
  "Tools & Ops",
] as const;

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
] as const;
