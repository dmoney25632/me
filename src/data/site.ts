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
  tagline: "Building profitable SaaS & AI tools that solve real problems.",
  supporting:
    "20-year-old founder studying Information Systems at BYU — shipping products, leading teams, and turning operations experience into software.",
  email: "dayton@evrcad.com",
  resumeUrl: "/resume.pdf",
  location: "Utah County, Utah",
  socials: {
    github: "https://github.com/daytonrunyan",
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
    id: "ops-automation",
    title: "Agency Ops Automation",
    description:
      "Internal tooling that automates compliance checks and client follow-ups.",
    longDescription:
      "A suite of automation scripts and dashboards that reduce manual compliance work for Medicare agencies. Monitors workflow status, flags risk items, and triggers follow-up sequences so teams stay audit-ready without drowning in admin.",
    learned:
      "The highest-leverage software often sits inside existing operations — automate the painful, repeatable steps first.",
    category: "AI",
    tech: ["Python", "TypeScript", "Supabase", "OpenAI"],
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    featured: true,
  },
  {
    id: "dixon-site",
    title: "Dixon Glass Website",
    description:
      "Marketing site and lead funnel for a glass installation company.",
    longDescription:
      "Designed and built the company website for Dixon Glass, including a customer management funnel that streamlined lead tracking and project organization. Paired with office systems infrastructure to keep field and office teams aligned.",
    learned:
      "Even traditional trades businesses win when digital systems make scheduling, leads, and communication frictionless.",
    category: "Other",
    tech: ["HTML", "CSS", "JavaScript"],
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
  },
  {
    id: "rags-systems",
    title: "Rags Cleaning Systems",
    description:
      "Custom scheduling, invoicing, and marketing systems for a service business.",
    longDescription:
      "Built the operational backbone for Rags Cleaning — scheduling, invoicing, and a marketing funnel that supported consistent revenue over three years. These systems taught the operational discipline now applied to SaaS product development.",
    learned:
      "Repeatable processes and customer-focused problem solving are the foundation of every product worth building.",
    category: "Tools",
    tech: ["JavaScript", "Spreadsheets", "Automation"],
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
  },
  {
    id: "security-lab",
    title: "Security+ Lab Notes",
    description:
      "Personal knowledge base and practice tooling around CompTIA Security+.",
    longDescription:
      "A structured study and practice environment built while earning CompTIA Security+. Covers core cybersecurity concepts, threat models, and hands-on lab notes — part of a broader push into computer engineering and security.",
    learned:
      "Security mindset changes how you design systems — assume failure modes early and design for resilience.",
    category: "Tools",
    tech: ["Markdown", "Linux", "Networking"],
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
    githubUrl: "https://github.com/daytonrunyan",
  },
  {
    id: "ai-cert-projects",
    title: "Google AI Capstone",
    description:
      "Applied AI workflows from the Google AI Professional Certificate.",
    longDescription:
      "Capstone-style projects exploring practical AI applications — prompt systems, evaluation loops, and lightweight automation that can plug into real business workflows. Focused on usefulness over demos.",
    learned:
      "AI is most valuable when tightly scoped to a real operational bottleneck, not when it's a feature for its own sake.",
    category: "AI",
    tech: ["Python", "Gemini", "LangChain"],
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80",
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
  { href: "#skills", label: "Skills" },
  { href: "#connect", label: "Connect" },
] as const;
