# Dayton Runyan

My personal site, two ways:

- **`/`** is a terminal. Visitors click or type commands (`companies`, `projects`, `play`, `cat`, `open`, `neofetch`, `help`…) to explore a filesystem that's all about me. It also runs real Rust on the visitor's machine (see below): `pwcheck`, `pwgen`, `encrypt`/`decrypt`, `hash`, `sysinfo`, `fingerprint`, `ip`, `ping`, `flock`.
- **`/about`** is the regular version: an editorial page with my photo, my companies, VAL, every project (simple explanation + technical breakdown), a game you can play, experience and links. Typing `gui` in the terminal goes there.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # terminal, content, privacy and security tests
npm run build      # production build
npm run smoke      # headless Chrome on every page, phone + desktop (needs `npm start` running)

npm run wasm       # recompile the Rust toolkit → public/wasm/kit.wasm (needs Rust)
npm run test:rust  # Rust tests: crypto test vectors + flock physics
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

## The Rust toolkit (terminal tools)

`rust/kit/` is one dependency-free Rust crate compiled to a ~70 KB WebAssembly module **with no imports**: it can't reach the network, the page or anything else, only compute on bytes it's handed. `src/lib/kit.ts` wraps it; `src/lib/terminal/tools.ts` turns it into commands.

| Command | What runs |
| --- | --- |
| `pwcheck` | `password.rs`: a zxcvbn-style estimator that counts guesses (leaked lists, l33t words, keyboard runs, years) and turns them into crack times. Asked for with a no-echo prompt, never saved to history. |
| `pwgen [len] [-n]` | `password.rs`: rejection-sampled, so every character is equally likely; random bytes from `crypto.getRandomValues`. |
| `encrypt` / `decrypt` | `cipher.rs`: PBKDF2-HMAC-SHA256 (210k rounds) → ChaCha20 + HMAC-SHA256 encrypt-then-MAC. Wrong passphrase or one flipped bit is rejected before decrypting. |
| `hash` | `sha256.rs`, cross-checked live against the browser's own SHA-256. |
| `sysinfo`, `fingerprint`, `ip`, `ping` | What the browser exposes about the visitor's device and network (fingerprint IDs are hashed in Rust, never sent). |
| `flock [n]` | `flock.rs`: boids with an O(n) grid neighbour search, drawn inline in the terminal. |

Everything is written from the specs and tested twice: `npm run test:rust` checks NIST/RFC vectors, and `tests/kit.test.ts` checks the compiled `.wasm` byte-for-byte against Node's OpenSSL. The `.wasm` is committed so the site deploys without Rust.

Change the Rust → `npm run test:rust` → `npm run wasm` → `npm test` → commit both. Links like `/?run=flock` open the terminal with a demo running (only the argument-free commands in `LINKABLE`, `Desktop.tsx`). `/lab` redirects there.

## Security

- **Nothing to log into.** The site is static pages plus two read-only API routes (`/api/net*`) that echo back what the visitor's own browser sent and store nothing. There is no database, no admin page, no form, no CMS. The only way to change the site is to push to this repo.
- **Headers** (`next.config.ts`): strict Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, no MIME sniffing, a locked-down Permissions-Policy, and no `X-Powered-By`.
- **Dependencies**: `npm audit` runs in CI and Dependabot opens PRs for fixes.
- **CI** (`.github/workflows/ci.yml`) typechecks, lints, tests, builds and audits every push with a read-only token.
- **The Rust module** has no imports (tested), so even a bug in it can't touch the network or the page. Passphrases are wiped from WebAssembly memory after use.
- **Privacy tests** (`tests/security.test.ts`) block image metadata, personal email addresses and `.env` files from shipping.

Keep it that way: 2FA on GitHub and Vercel, never commit `.env` files, and keep `main` protected.

## How the code is organized

| Path | What |
| --- | --- |
| `src/content/` | All the words (see above). |
| `src/lib/terminal/` | The shell, with no React: paths, commands, tab completion. Commands return output blocks (lines, markdown, images, cards, widgets), can stream async output, and can ask for secrets. Add a command in `commands.ts` (or `tools.ts` for the Rust ones). |
| `src/lib/kit.ts` | Typed bridge to the Rust WebAssembly module. |
| `src/components/terminal/` | The macOS-style desktop, window, input line, output renderer and the inline flock (`FlockView.tsx`). |
| `src/app/about/` + `src/components/about/` | The `/about` page: hero, nav, `BrowserFrame`, `ProjectGrid`. |
| `src/components/ui/` | Shared bits: animations (`motion.tsx`), button styles, brand icons. |
| `rust/kit/` | The Rust toolkit: SHA-256/HMAC/PBKDF2, ChaCha20 encryption, password meter, flock. |
| `src/app/net/` + `src/app/api/net/` | `~/net`: what your browser tells a server about you. |
| `scripts/` | `shots.mjs` (card screenshots), `build-wasm.mjs`, `smoke.mjs` (end-to-end check). |
| `tests/` | Vitest: terminal + content, privacy + security. |
| `.github/` | CI and Dependabot. |

Markdown files in the terminal can link to commands with `[label](cmd:cat about.md)` and show pictures with `![alt](/shots/x.jpg)`.
