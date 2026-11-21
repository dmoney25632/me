// The shapes of everything in src/content. If you're adding content, you
// mostly just copy an existing entry and change the words.

export interface Company {
  /** Short id, used for ~/companies/<id>.md in the terminal. */
  id: string;
  name: string;
  /** My role, e.g. "Founder". */
  role: string;
  /** e.g. "2020 — 2023" or "2026 — Now". */
  period: string;
  /** The company's website. */
  url: string;
  /** One plain-English sentence: what the company does. */
  oneLiner: string;
  /** A short paragraph: the story and what I did there. */
  story: string;
  /** What I built or did, one bullet each. */
  highlights: string[];
  stack?: string[];
  /** Screenshot in public/shots (refresh with `npm run shots`). */
  shot?: string;
  /** Square logo in public/logos. Used for the card cover when there's no screenshot. */
  logo?: string;
  /** Brand color for the logo cover, e.g. "#1a5fa8". */
  color?: string;
  /** Tagline under the name on the logo cover. */
  tag?: string;
  /** Small label in the corner of the logo cover. */
  badge?: string;
}

export type ProjectKind = "AI" | "Game" | "Data" | "Web" | "Web3" | "SaaS" | "Rust";

export interface Project {
  /** Short id, used for ~/projects/<id>.md in the terminal. */
  id: string;
  name: string;
  kind: ProjectKind;
  year: string;
  /** The simple breakdown: one plain-English sentence anyone gets. */
  oneLiner: string;
  /** The technical breakdown: how it's built, one bullet each. Optional: leave it out to keep a project vague. */
  howItWorks?: string[];
  stack?: string[];
  links: {
    /** A website people can visit. */
    live?: string;
    /** A game people can play. */
    play?: string;
    /** Only for PUBLIC repos (private ones 404 for visitors). */
    code?: string;
  };
  /** Screenshot in public/shots (refresh with `npm run shots`). */
  shot?: string;
  /** Square logo in public/logos. Used for the card cover when there's no screenshot. */
  logo?: string;
  /** Brand color for the logo cover, e.g. "#1a5fa8". */
  color?: string;
  /** Tagline under the name on the logo cover. */
  tag?: string;
  /** Small label in the corner of the logo cover. */
  badge?: string;
  /** Featured projects sort first and get a ✦. */
  featured?: boolean;
}

export interface Job {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
}

export interface School {
  name: string;
  detail: string;
  period: string;
}
