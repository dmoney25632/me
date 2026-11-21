// Jobs, school, certifications and honors, kept in sync with LinkedIn.
// My own companies (Future 42, Corva, Rags) live in companies.ts.

import type { Cert, Honor, Job, School } from "./types";

export const jobs: Job[] = [
  {
    company: "The Church of Jesus Christ of Latter-day Saints",
    role: "Missionary",
    period: "2023 — 2025",
    location: "Cali, Colombia",
    description:
      "Served full-time in Cali, Popayán and Pasto, Colombia. Managed community relationships, became fluent in Spanish, and trained and worked personally with 140+ volunteers in a fast-moving, high-autonomy environment.",
  },
  {
    company: "Dixon Glass",
    role: "Manager",
    period: "2022 — 2023",
    location: "Utah",
    description:
      "Managed daily operations and job-site workflows for a glass installation company. Built a pricing system that led to a 30%+ increase in revenue over 12 months, and a customer funnel that streamlined lead tracking and project organization.",
  },
];

export const schools: School[] = [
  {
    name: "Brigham Young University",
    short: "BYU",
    detail: "Information Systems, then a Master's in Information Systems Security",
    period: "2025 — 2028",
  },
  {
    name: "Sandbox",
    short: "Sandbox SB06",
    detail: "SB06 cohort, Software Engineering",
    period: "2026 — 2027",
  },
];

export const certs: Cert[] = [
  { name: "Foundry & AIP Builder Foundations", issuer: "Palantir", date: "2026", url: "https://verify.skilljar.com/c/gc2uu5t6s8i7" },
  { name: "Certified Foundry Aware Professional", issuer: "Palantir", date: "2026", url: "https://verify.skilljar.com/c/mfgusq23izow" },
  {
    name: "Google AI Professional Certificate",
    issuer: "Google",
    date: "2026",
    url: "https://www.credly.com/badges/d3185beb-6ae4-4b53-acdb-b17d26bb7214",
  },
  {
    name: "Security+",
    issuer: "CompTIA",
    date: "2026",
    url: "https://www.credly.com/badges/0c3676d3-8719-4a94-b923-5ef154306929",
  },
  { name: "Health Insurance License", issuer: "State of Utah", date: "2025" },
];

export const honors: Honor[] = [
  { name: "Eagle Scout", detail: "Boy Scouts of America", date: "2018" },
  { name: "1st Team All-State Football", detail: "Utah High School Activities Association" },
  { name: "1st Team All-State Track", detail: "Utah High School Activities Association" },
];
