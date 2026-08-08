<p align="center">
  <img src="public/favicon.svg" width="48" height="48" alt="PathWise mark" />
</p>

<h1 align="center">PathWise</h1>

<p align="center">
  <strong>Some decisions deserve more than an answer.</strong><br />
  Turn complicated choices into interactive maps of paths, consequences, and tradeoffs.
</p>

<p align="center">
  <a href="https://github.com/Amaar-Ali/PathWise">GitHub</a>
  ·
  <a href="#quick-start">Quick start</a>
  ·
  <a href="#how-it-works">How it works</a>
  ·
  <a href="#environment">Environment</a>
</p>

---

## What is PathWise?

Most AI tools answer decisions with a wall of text. PathWise does something different:

**Decision → Options → Consequences → Further choices → Outcomes**

You explore the map. You stay in charge. PathWise sits beside you while you think — calm, direct, and honest about uncertainty.

| Mode | What you get |
| --- | --- |
| **Guest** | Try a full decision map without an account |
| **Free account** | Save decisions + a daily allowance |
| **Pro / Premium** | Deeper maps, more decisions, richer exploration |

---

## Stack

- **TanStack Start** + React 19 + TypeScript
- **Vite 8** + Tailwind CSS 4
- **Firebase** Auth + Firestore (plans / ownership)
- **Groq** (Qwen) for adaptive questions + map generation
- **Paddle** for one-time Pro / Premium purchases
- **Nitro** deploy target (`cloudflare-module` by default)

---

## Quick start

```bash
git clone https://github.com/Amaar-Ali/PathWise.git
cd main
npm install
cp .env.example .env.local
# fill in keys (see Environment below)
npm run dev
```

App runs at [http://localhost:8080](http://localhost:8080).

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

---

## How it works

```text
Landing
  → Start a decision
  → Adaptive context questions
  → PathWise builds the map
  → Explore nodes, paths, timeline, insights
  → Save (signed-in) or upgrade for more depth
```

### Core product surfaces

- **`/`** — Landing, scroll story, interactive demo map
- **`/decide`** — Create a decision (guest or signed-in)
- **`/decisions`** — Saved decision library
- **`/decisions/$id`** — Full interactive map + panels
- **`/pro`** — Plans (Free / Pro / Premium)

### Philosophy (short)

- Help people **think**, don’t pretend to predict the future
- Prefer a few honest insights over generic bullet spam
- The **map is the product** — not decoration around a chatbot

---

## Project layout

```text
src/
  components/     UI, map, assessment, site chrome
  hooks/          Auth, plan, mobile helpers
  lib/            Decision model, AI, Firebase, Paddle
  routes/         File-based TanStack Router pages + API
  styles.css      Design tokens + global styles
```

Key modules:

- `src/lib/decision-model.ts` — shared decision tree types
- `src/lib/generate.server.ts` — AI generation (server-only)
- `src/components/map/DecisionMap.tsx` — interactive map canvas
- `src/components/assessment/` — conversational setup flow

---

## Environment

Copy `.env.example` → `.env.local`. **Never commit `.env.local`.**

### Client (`VITE_*`)

Firebase web config + Paddle public token / price IDs.

### Server (no `VITE_` prefix)

| Variable | Purpose |
| --- | --- |
| `GROQ_API_KEY` | Required for `/decide` generation |
| `GROQ_MODEL` | Defaults to `qwen/qwen3.6-27b` |
| `PADDLE_WEBHOOK_SECRET` | Verifies Paddle webhooks |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Admin SDK for plan writes |

After changing env vars, **fully restart** `npm run dev` — server env loads at boot.

---

## Auth, billing, AI

- **Auth** — Firebase (email/password + Google when enabled)
- **Billing** — Paddle one-time purchases (not subscriptions); webhook at `/api/webhooks/paddle`
- **AI** — Groq OpenAI-compatible API; keys stay server-side

Legal / policy pages live under routes like `/terms`, `/privacy`, `/disclaimer`.

---

## Design notes

- Warm cream surfaces + restrained teal accent
- Display: **Fraunces** · UI: **Manrope**
- Floating transparent header; full-viewport hero
- Motion for hierarchy (paths, focus, panels) — not noise

---

## Deploy

Production builds use Nitro (`cloudflare-module` by default):

```bash
npm run build
npx vite preview   # local check
# or: npx nitro deploy --prebuilt
```

Configure Firebase authorized domains + Paddle webhook URL for your production host.

---

## Contributing

1. Keep diffs focused
2. Match existing patterns in `src/`
3. Run `npm run lint` and `npm run build` before pushing
4. See `AGENTS.md` for short agent / collaborator notes

---

<p align="center">
  <sub>PathWise helps you think through decisions — it doesn’t promise the future.</sub>
</p>
