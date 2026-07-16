# Breeze — a Whimsical clone

Collaborative visual workspace: flowcharts, wireframes, sticky-note boards and docs on a shared canvas. Built from the "Breeze" design handoff for feature parity with [whimsical.com/home](https://whimsical.com/home).

**Live:** https://breeze-hq.netlify.app
**Repo:** https://github.com/beachedazd/whimsical-clone

## Stack

- **Frontend:** Vite + React 19 + TypeScript, plain CSS (design tokens in `src/index.css`)
- **Backend:** Supabase (Postgres + RLS, auth, auto-provisioned personal workspace on signup)
- **Hosting:** Netlify (SPA redirects via `netlify.toml`)

## Features

- Marketing landing page + email/password auth
- Workspace dashboard: projects (folders), recent/favorites views, search, file cards with type-specific thumbnails, rename/duplicate/move/delete/favorite
- Flowchart editor: shapes (rect/pill/diamond/ellipse/text/sticky), connectors with labels & arrowheads, drag/resize, marquee select, pan/zoom/fit, undo/redo, autosave
- Wireframe editor: UI element library (button, input, image, toggle, tabs, phone frame) + inspector
- Sticky board: colored notes with vote dots
- Doc editor: rich text (headings, lists, quotes, code), floating format toolbar, outline sidebar, autosave

## Development

```sh
npm install
cp .env.example .env   # fill in your Supabase project URL + anon key
npm run dev
```

Database schema lives in `supabase/migrations/`. Apply with:

```sh
supabase link --project-ref <your-ref>
supabase db push
```

## Architecture notes

- All data access goes through `src/lib/api.ts`; RLS policies enforce workspace membership server-side (`security definer` helper avoids recursive policies).
- Board/doc contents are stored as `jsonb` in `files.content`; autosave is debounced client-side.
- A Postgres trigger on `auth.users` creates the profile, personal workspace and owner membership at signup.
