# Dayton Runyan

My personal site, two ways:

- **`/`** is a terminal. Visitors click or type commands (`companies`, `projects`, `play`, `cat`, `open`, `neofetch`, `help`…) to explore a filesystem that's all about me.
- **`/about`** is the regular version: an editorial page with my photo, my companies, VAL, every project (simple explanation + technical breakdown), a game you can play, experience and links. Typing `gui` in the terminal goes there.
- **`/lab`** is **Flock**: thousands of birds flocking in real time, simulated in Rust and compiled to WebAssembly. Typing `lab` in the terminal goes there.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # terminal, content, privacy and security tests
npm run build      # production build
npm run smoke      # headless Chrome on every page, phone + desktop (needs `npm start` running)

npm run wasm       # recompile the Rust sim → public/wasm/flock.wasm (needs Rust)
npm run test:rust  # the sim's physics tests
```

## Changing what the site says

**Everything the site says lives in `src/content/`.** Both pages read from the same files, so you edit things once.

| File | What's in it |
| --- | --- |
| `me.ts` | Name, links (GitHub, X, LinkedIn), bio, about bullets, `now`, photos, `/about` hero copy |
| `companies.ts` | Companies I've started (Future 42, Corva, Rags Cleaning) and VAL |
| `projects.ts` | Side projects, including the game |
| `experience.ts` | Jobs and school |
| `writing.ts` | Essays |
| `lab.ts` | Words on `/lab` |
| `filesystem.ts` | Turns all of the above into the terminal's folders. Add one-off files or easter eggs here. |
| `types.ts` | The shape of a company / project / job, with comments |

### Add a project

1. Open `src/content/projects.ts`, copy an entry, and change it:
   - `oneLiner` is the plain-English version ("what is it?").
   - `howItWorks` is the technical breakdown (one bullet per idea).
   - `links.live` / `links.play` / `links.code`. Only set `code` for **public** repos; private ones show a "Private repo · GitHub" button instead.
   - `featured: true` puts it at the top of the list with a ✦.
2. Optional screenshot: `npm run shots -- <id> <url>` saves `public/shots/<id>.jpg`. Then set `shot: "/shots/<id>.jpg"`.

It now shows up as a card on `/about`, in `projects`, and as `~/projects/<id>.md` in the terminal.

### Add a company

Same idea in `src/content/companies.ts`. It gets a big card with a browser-framed screenshot on `/about`, a line in `companies`, and `~/companies/<id>.md` + `<id>.url` in the terminal.

### Photos

Put them in `public/photos/` and list them in `me.ts` (`portraits` or `lifePhotos`).

**Phone photos carry your GPS location.** Strip it before committing:

```bash
node -e "const s=require('sharp'),f=process.argv[1];s(f).rotate().jpeg({quality:84}).toBuffer().then(b=>require('fs').writeFileSync(f,b))" public/photos/NEW.jpg
```

`npm test` fails if any image in `public/` still has metadata, so you can't ship one by accident.

## The Rust sim (`/lab`)

`rust/flock/src/lib.rs` is the whole simulation: plain Rust, zero dependencies, compiled to a ~36 KB WebAssembly module with no imports. `src/components/lab/` loads it, calls `flock_step` every frame and draws the birds on a canvas. The compiled `.wasm` is committed so the site deploys without Rust.

Change the Rust → `npm run test:rust` → `npm run wasm` → commit both.

## Security

- **Nothing to log into.** The site is static pages plus two read-only API routes (`/api/net*`) that echo back what the visitor's own browser sent and store nothing. There is no database, no admin page, no form, no CMS. The only way to change the site is to push to this repo.
- **Headers** (`next.config.ts`): strict Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, no MIME sniffing, a locked-down Permissions-Policy, and no `X-Powered-By`.
- **Dependencies**: `npm audit` runs in CI and Dependabot opens PRs for fixes.
- **CI** (`.github/workflows/ci.yml`) typechecks, lints, tests, builds and audits every push with a read-only token.
- **Privacy tests** (`tests/security.test.ts`) block image metadata, personal email addresses and `.env` files from shipping.

Keep it that way: 2FA on GitHub and Vercel, never commit `.env` files, and keep `main` protected.

## How the code is organized

| Path | What |
| --- | --- |
| `src/content/` | All the words (see above). |
| `src/lib/terminal/` | The shell, with no React: paths, commands, tab completion. Commands return output blocks (lines, markdown, images, cards). Add a command in `commands.ts`. |
| `src/components/terminal/` | The macOS-style desktop, window, input line and output renderer. |
| `src/app/about/` + `src/components/about/` | The `/about` page: hero, nav, `BrowserFrame`, `ProjectGrid`. |
| `src/app/lab/` + `src/components/lab/` | `/lab`: the canvas, controls and WebAssembly loader for Flock. |
| `src/components/ui/` | Shared bits: animations (`motion.tsx`), button styles, brand icons. |
| `rust/flock/` | The Rust flocking simulation. |
| `src/app/net/` + `src/app/api/net/` | `~/net`: what your browser tells a server about you. |
| `scripts/` | `shots.mjs` (card screenshots), `build-wasm.mjs`, `smoke.mjs` (end-to-end check). |
| `tests/` | Vitest: terminal + content, privacy + security. |
| `.github/` | CI and Dependabot. |

Markdown files in the terminal can link to commands with `[label](cmd:cat about.md)` and show pictures with `![alt](/shots/x.jpg)`.
