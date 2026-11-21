# Dayton Runyan

My personal site, two ways:

- **`/`** is a terminal. Visitors type commands (`ls`, `cd`, `cat`, `open`, `neofetch`, `help`…) to explore a filesystem that's all about me.
- **`/about`** is the regular version: an editorial page (same style as the peyton site) with my photo, VAL, every project with a technical breakdown, experience, and links to GitHub and X. Typing `gui` in the terminal goes there.

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # shell engine tests
```

## Editing content

All copy lives in `src/content/`:

- `site.ts` — bio, experience, projects (with a `built` list for the technical breakdown), education, about bullets, `now`, photos, and the `/about` page copy (`profile`). Adding a project here adds it to both pages.
- Only set `githubUrl` for public repos; private ones show a "Private repo · GitHub" link to the profile instead.
- `writing.ts` — essays. Each becomes `~/writing/<slug>.md` (or a `.url` file if it's hosted elsewhere).
- `filesystem.ts` — how those lists become files and folders. Add one-off files (or easter eggs) here.
- Photos go in `public/photos/` and get listed in `photos` in `site.ts`.

## How it works

| Path | What |
| --- | --- |
| `src/lib/terminal/` | The shell, with no React: path resolution, commands, tab completion. Commands return output blocks (lines, markdown, images). |
| `src/components/terminal/` | The macOS-style desktop, window chrome, input line and output renderer. |
| `src/app/about/` + `src/components/profile/` | The editorial `/about` page. |
| `src/app/net/` + `src/app/api/net/` | `~/net`: shows what your browser tells a server about you. `net` in the terminal is the short version. |
| `tests/` | Vitest tests for the shell. |

Markdown files can link to commands with `[label](cmd:cat about.md)`: they render as clickable commands.
