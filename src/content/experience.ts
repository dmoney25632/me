// Jobs and school. My own companies live in companies.ts.

import type { Job, School } from "./types";

export const jobs: Job[] = [
  {
    company: "Peak Senior Solutions",
    role: "Managing Partner",
    period: "2025 — 2026",
    location: "Utah",
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
    location: "Utah",
    description:
      "Managed daily operations and job-site workflows. Designed a customer management funnel, built the company website, and coordinated scheduling across concurrent projects.",
  },
];

export const schools: School[] = [
  { name: "Brigham Young University", detail: "B.S., Information Systems", period: "In progress" },
  { name: "CompTIA Security+", detail: "Certification", period: "Certified" },
];
