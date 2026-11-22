// Who I am: name, links, bio, photos and the /about page hero.
// Change the words here and both pages (terminal + /about) update.

export const me = {
  name: "Dayton Runyan",
  initials: "DR",
  title: "Founder & Builder",
  location: "Utah County, Utah",
  tagline: "Co-founder of Future 42. Building VAL: AI that helps auto repair shops coach their crew and hit their numbers.",
  intro:
    "Most of my time goes into Future 42, where we're building VAL: an AI that lives inside the shop, reads the day's numbers, and tells the crew what to do about them before anyone asks. Before that I started a window cleaning company, co-founded a Medicare agency, and built whatever else needed building.",
  links: {
    github: "https://github.com/dmoney25632",
    x: "https://x.com/daytonrunyan",
    linkedin: "https://linkedin.com/in/daytonrunyan",
  },
};

/** Short facts about me. Shown in ~/about.md and the /about page. */
export const aboutBullets = [
  "Co-founder of Future 42. We build VAL, AI that runs auto repair shops.",
  "Started my first business, Rags Cleaning, in 2020.",
  "Co-founded Corva Insurance Group, a Medicare agency. I work with 100+ clients personally.",
  "Served a two-year mission in Cali, Popayán and Pasto, Colombia. Fluent in Spanish.",
  "Studying Information Systems and cybersecurity at BYU, and in Sandbox's SB06 cohort.",
  "Eagle Scout. First-team all-state in football and track.",
];

/** ~/about.md: "what I care about". */
export const values = [
  "Software that does the work instead of showing a dashboard about it.",
  "Shipping to real users early, then fixing what they actually hit.",
  "Small businesses: the ones that keep a town running.",
];

/** ~/now.md. Update it whenever it changes. */
export const now = {
  updated: "2026-11-20",
  items: [
    "Running VAL live in real tire and auto shops.",
    "Building the crew's phone app and nightly coaching.",
    "Finishing my degrees at BYU.",
    "In Sandbox's SB06 cohort.",
  ],
};

/** Photos live in public/photos and show up as ~/photos/<file>. */
export const portrait = {
  file: "dayton.jpg",
  src: "/photos/dayton.jpg",
  alt: "Pixel-art portrait of Dayton Runyan holding a corgi in an office",
};

/** Photo strip on /about. Add a photo here and it shows up there and in ~/photos. */
export const lifePhotos = [
  {
    file: "google-startups-sf.jpg",
    src: "/photos/google-startups-sf.jpg",
    alt: "Dayton on a rooftop in San Francisco at a Google for Startups event",
  },
  {
    file: "skiing.jpg",
    src: "/photos/skiing.jpg",
    alt: "Dayton and a friend in ski gear at the top of a snowy run",
  },
  {
    file: "car-show.jpg",
    src: "/photos/car-show.jpg",
    alt: "Dayton crouching next to a black custom Mustang at a car show",
  },
  {
    file: "fishing.jpg",
    src: "/photos/fishing.jpg",
    alt: "Dayton in waders at dusk holding up a stringer of trout by a lake",
  },
  {
    file: "late-night.jpg",
    src: "/photos/late-night.jpg",
    alt: "A friend asleep on a library desk next to laptops and a monitor",
  },
];

export const photos = [portrait, ...lifePhotos];

/** Copy for the top of the /about page. */
export const hero = {
  badge: "Co-founder · Future 42",
  /** Wrap a word as { text, italic: true } to set it in maroon italics. */
  headline: ["Building", "software", "that", "does", "the", { text: "work.", italic: true as const }],
  sub: "I'm building VAL at Future 42: AI that lives inside auto repair shops, reads the day's numbers, and tells the crew what to do next. I've been starting things since 2020.",
  portrait,
  seal: "FOUNDER · FUTURE 42 · BYU · ",
  est: "2020",
  marquee: ["AI agents", "Next.js", "TypeScript", "Python", "Three.js", "Supabase", "Data & ML", "Security+", "Español"],
};
