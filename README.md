# Handoff: ManaMap — Design Doc + Waitlist Landing Page

## Overview

ManaMap is a discovery and infrastructure layer for the Magic: The Gathering creator ecosystem — framed as **"IMDb + LinkedIn + Bandsintown for MTG creators."** It is *not* a social network. The product is a searchable directory of MTG creators with structured metadata, cross-platform identity aggregation, event tracking, and business tools for creators and local game stores.

This package contains:

- A long-form **design document** (`references/ManaMap Design Doc.html`) with strategy, IA, 9 screen wireframes, data model, and a 6-phase roadmap.
- A **waitlist landing page** (`references/ManaMap Landing.html`) with three embedded mock screenshots (Discovery, Creator Profile, Event Page).
- All supporting CSS, design tokens, and a `CLAUDE.md` configured for Claude Code in your IDE.

---

## About the Design Files

The HTML files in this bundle are **design references** — interactive prototypes built in plain HTML/CSS to communicate the intended look, behavior, and information architecture. They are **not production code to copy directly.**

The task is to **recreate these designs in a real Next.js codebase** using the established patterns documented below. If you are starting from scratch, the recommended stack is in [`CLAUDE.md`](./CLAUDE.md) — Next.js 15 (App Router) + React 19 + TypeScript + Tailwind v4 + Drizzle ORM + Postgres (Neon).

If you have an existing codebase with different conventions, adapt the design to match — but preserve the visual system (colors, type, spacing) precisely.

---

## Fidelity

**High-fidelity for visual system; medium-fidelity for component detail.**

- **Colors, type, spacing, and overall composition are final.** Match hex codes, font families, and layout grids precisely. The design tokens in `design-tokens.css` are the source of truth.
- **Specific copy, creator names, numbers, and content are illustrative.** They demonstrate intent; replace with real or empty-state content in production.
- **Some details (hover states, focus rings, loading skeletons, empty states, error states) are not designed.** Use the codebase's existing patterns or extend the system in the spirit of the brand (editorial, monospace labels, hairline borders).

---

## Brand & Visual System

Read this section *first* — every screen in the design depends on it.

### Type stack

| Role | Family | Notes |
|---|---|---|
| Display / headlines | **Newsreader** (Google Fonts) | Serif, italic-rich. Use italic for emphasis within H1/H2. |
| Body / UI | **Geist** (Google Fonts) | Modern sans, 14–16px body, 11px labels. Replaces Inter. |
| Mono / metadata | **Geist Mono** (Google Fonts) | All-caps small labels, stats, timestamps, code. |

### Color tokens

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F5F1E8` | App background — warm parchment |
| `--paper-soft` | `#EFEBDF` | Inset surfaces, hover backgrounds |
| `--surface` | `#FFFFFF` | Cards, inputs |
| `--surface-tint` | `#FBF8F0` | Subtle elevated surfaces |
| `--hairline` | `#E3DCC9` | Dividers, card borders |
| `--hairline-strong` | `#CFC6AD` | Emphasized borders, button outlines |
| `--ink` | `#1A1813` | Primary text, primary button |
| `--ink-2` | `#3D3830` | Secondary text, captions |
| `--ink-3` | `#6B6558` | Tertiary text, metadata labels |
| `--ink-4` | `#9A9382` | Muted text, placeholders |
| `--ink-5` | `#BFB8A5` | Disabled, on-dark secondary |

### WUBRG accents — color only, no symbols

| Token | Hex | Use |
|---|---|---|
| `--w` | `#D4C68E` | White format pip |
| `--u` | `#3F6FA8` | Blue format pip |
| `--b` | `#2C2730` | Black format pip |
| `--r` | `#BF5142` | Red format pip |
| `--g` | `#5C8A5A` | Green format pip |

**CRITICAL:** Never use mana symbols, never render card frames, never reproduce Wizards of the Coast trade dress. WUBRG colors are used **only as small colored dots** (12×12px pips) to indicate format/color affinity. The brand is editorial and infrastructure-grade, not gamified.

### Spacing & layout

- **Grid:** 8px base unit. Common gaps: 8 / 12 / 16 / 24 / 32 / 48 / 64.
- **Border radius:** 0 (most surfaces), 4 (small chips), 6 (inputs), 8 (cards), 10 (mockup frames), 999px (pills).
- **Hairlines:** 1px borders in `--hairline` are the primary visual divider. Avoid shadows except on hero screenshots.
- **Content column:** Long-form doc content max-width ~720px. Landing page wraps at 1200px.

### Type rules in practice

- **Italic Newsreader** is for emphasis within headlines (`<em>` inside `<h1>`/`<h2>`).
- **Geist Mono uppercase 10–11px with `letter-spacing: 0.08–0.1em`** is the canonical label style — used for eyebrows, metadata, tags, stats, captions.
- **Body text** is Geist 14–16px, `line-height: 1.55–1.6`, `text-wrap: pretty` on paragraphs.
- **Never use emoji.** Never use system fonts as headlines.

---

## Screens / Views

The design doc (`ManaMap Design Doc.html`) contains 9 desktop screens + 3 mobile screens. Each is built as inline HTML with the same design tokens. Below is a screen-by-screen guide.

### 9.1 — Homepage / Discovery (`/`)

**Purpose:** The front door. Search-first for fans; secondary CTA for creator claim.

**Layout:**
- Top nav: brand left, 4 link items center, sign-in + claim-profile buttons right.
- Hero: H1 (`Find the people behind the format you love.`), one-line deck, search bar (pill-shaped, with creator/event/store segmented toggle), color-pie chip rail.
- "Featured this week": one large featured creator card (dark ink background) + 2 standard cards.
- "Trending in EDH": 4-column grid of standard creator cards.
- "Happening soon near you": 3-column event card strip with date stamp.

**Components:**
- **Creator card (small)** — white surface, hairline border, 10px radius. Top: color bar (4px tall, divided into 1–5 WUBRG slices). Body: serif name, mono `@handle · city`, chip-style tags. Footer: stats row in mono.
- **Featured creator card (large)** — `--ink` background, `--paper` text. Eyebrow "Creator of the week" → 32px serif name → blurb → WUBRG pips → meta row.
- **Event card** — flex row: vertical date stamp (mono month + 28px serif day) | event title (serif) + location (mono caps) + attendees.

### 9.2 — Creator Profile (`/c/[slug]`)

**Purpose:** The canonical page. The whole product sits on this URL.

**Layout:**
- Profile hero: 92px circular avatar (with `--paper-soft` placeholder + dashed `ring`), serif name (40px), mono handle, meta row (followers per platform), bio (`<em>` for italic emphasis), chip row with selected/unselected tags.
- Body: two-column 1fr / 280px. Left: tabs (Content / Decks / Events / About) → 2-column content tile grid. Right: side rail with grouped link lists.

**Tabs are visually flat** — underline-on-active, no fills. Hairline border below the tab bar.

**Content tiles** — white surface card, 8px radius. 16:9 thumb (subtle gradient placeholder until real thumbnails), platform pill (`YouTube` / `Twitch` / `Podcast`) top-left, title + mono sub.

**Side rail groups** — `Platforms`, `Upcoming`, `Similar creators`, `Business`. Each group: 10px mono uppercase heading + stacked rows with hairline-bottom separators.

### 9.3 — Search & Filters (`/search`)

**Purpose:** Power-user surface. Filter combinations are canonical, shareable URLs.

**Layout:**
- 2-column: 220px facets sidebar | results.
- Facets: grouped checkbox lists (Formats, Colors, Content type, Audience style, Region). Each option shows count in mono on the right. Color filter row is a flex-wrap of pill chips with embedded WUBRG pips.
- Results: header with serif count + mono filter description, then row-based result list.

**Result row** — 56px avatar | name + meta + tag chips | YouTube count (mono) | Match % (mono). Hairline-bottom divider per row. `:hover` adds `--paper-soft` background.

The "Match %" column is the recommendation engine surfaced as a sort key.

### 9.4 — Creator Dashboard (`/dashboard/profile`)

**Purpose:** Where claimed profiles are edited. Pure form, no live preview in v1.

**Layout:**
- 200px dark sidebar (`--ink` bg, `--paper` text) with grouped nav: Workspace / Business / Account.
- Main area: H2 + mono completion meta + 4-stat grid + the edit form.

**Form pattern:** Each field is a 160px label / 1fr input row, separated by hairlines. Labels use mono 11px with a regular-case `hint` line beneath. Inputs have `--surface-tint` bg, hairline border, 5px radius, 8/12px padding.

**Chips for multi-select** (formats, content types, audience style, colors): inactive chips are mono uppercase on `--paper-soft`; active are `.solid` (dark fill, paper text).

### 9.5 — Event Page (`/event/[slug]`)

**Purpose:** Network-effects screen. Convention + RCQ + local night equivalent.

**Layout:**
- Dark hero band (`--ink`): eyebrow → 40px serif event name → mono "where" row → CTA row.
- Body: 1fr / 240px. Left: attendees grid (4-col cards with 36px avatar + name + role) + schedule list. Right: side rail with Organizer / Tracked-by / Nearby stores groups.

**Schedule row** — 70px mono time / serif title / mono booth/location.

### 9.6 — Store / LGS Page (`/store/[slug]`)

**Purpose:** SaaS surface. Public page + (separately) a CRM backend.

**Layout:**
- Store hero: 2-column. Left = eyebrow + 32px serif name + mono address + bio + stats strip. Right = striped placeholder for the eventual store photo.
- Body: 2-column. Left = upcoming events. Right = featured creators + booking marketplace note + primary CTA.

### 9.7 — Onboarding Flow

**Purpose:** Under-90-second creator setup. 4 steps in a single row.

Each step card:
- Mono step number + time estimate
- 18px serif step title
- 12px description
- Inline preview chip (`--paper-soft` bg) showing what the step results in.

### 9.8 — Media Kit / Sponsor View (`/c/[slug]/kit`)

**Purpose:** A printable, public, link-shareable creator press kit.

**Layout:**
- 2-column. Left = dark `--ink` "press kit" pane: eyebrow / 28px serif name / mono handle / bio / 2×2 metric grid.
- Right = light pane: "Platform mix" stacked horizontal bars + "Audience" key-value table + "Recent partnerships" list + CTA buttons (Send sponsor inquiry / Download PDF).

### 9.9 — Recommendations / Similar Creators

**Purpose:** Explainable recommendations. Every rail has a one-line *reason* in italic serif.

Three rails, each:
- Rail header: serif "why" line (with `<em>` for the matched creator) + mono "Refresh / See all" link.
- 5-column grid of small rec items: 32px avatar + serif name + mono "why this matched" caption.

### 10. Mobile (Discover / Profile / Event)

Built in a thin phone bezel. Bottom tab bar with 4 destinations (Discover / Events / Saved / Me). Color pip row replaces the desktop chip rail. Cards collapse to single-column. Mobile is critical — assume ≥40% of fan traffic.

---

## Landing Page

`references/ManaMap Landing.html` is a polished waitlist page that uses the same design system. Sections in order:

1. Top nav (sticky, translucent paper bg)
2. Hero — H1 with italic emphasis, deck, email signup pill, side meta card (creators/events/stores counters + WUBRG pip row)
3. Strategic quote callout
4. Screenshot 1 — Discovery (with `shot-tag` callouts)
5. Three pillars (Directory / Identity / Events ≈ IMDb / LinkedIn / Bandsintown)
6. Screenshot 2 — Creator profile
7. Who-it's-for (3 cards: Fans / Creators / Stores with inline pricing)
8. Screenshot 3 — Event page (in a dark section)
9. Manifesto — 6 product principles in a 2×3 dark grid
10. Mini roadmap — 6 phase cards, current phase highlighted
11. Final CTA (centered, italic serif headline)
12. Footer

Screenshot wrappers use the `.shot-stage` / `.shot` / `.shot-cap` pattern with `.shot-tag.tl/.tr/.bl/.br` for the floating callout pills.

---

## Interactions & Behavior

- **Email signup** — Email input + button. On submit, button text flips to "On the list ✓". In production, hook to **Resend** (or just **Tally / Formspree** for the waitlist v0).
- **Search bar** — Segmented toggle (Creators / Events / Stores) determines which entity to query. Pressing Enter or clicking the button navigates to `/search?q=…&kind=…`.
- **Color chips** — Multi-select, AND filter. Selected state: `.ch.on` (dark fill).
- **Filter facets** — Standard multi-select checkbox lists. Each toggle updates URL params and re-runs the query without a full page reload.
- **Tabs** (profile) — Pure client-side state, no URL change. Active tab gets a 2px ink-color bottom border.
- **Hover** — Card surfaces lift subtly via the existing shadow tokens. Result rows get `--paper-soft` background.
- **Animations** — None designed. Use `transition: all 120ms` for hover state changes; do not add scroll-triggered animations or carousels.

---

## State Management

Routes that need server state:
- `/`, `/format/[x]`, `/tag/[x]`, `/region/[x]` — featured + trending + events. Cache aggressively (revalidate on the hour).
- `/c/[slug]` — creator + aggregated content + similar creators. Static-ish; revalidate on dashboard edits.
- `/search` — query → result list. URL params are the state.
- `/dashboard/*` — authenticated, form state is local + submit-to-server.

Recommended approach in Next.js 15:
- **RSC + Server Actions** for everything user-facing. No client state library needed for v1.
- **`searchParams`** as the source of truth for the search page; no `useState`.
- **`react-hook-form` + `zod`** for the dashboard forms.
- **`SWR`** only if/when you add client-side optimistic updates (Phase 4+).

---

## Data Model

Section 11 of the design doc lists the entities. Drizzle schema sketch (illustrative — flesh out fields when implementing):

```ts
users          // id, email, role, createdAt
creatorProfiles // slug, displayName, bio, region, verified
socialAccounts // creatorId, platform, handle, url, followers
formatTags     // code, name, colors[]
contentTags    // code, kind, label
featuredContent // creatorId, platform, externalId, title, publishedAt
events         // slug, kind, dateRange, location
appearances    // creatorId, eventId, role
stores         // slug, name, address, regionId
regions        // code, name, timezone
bookings       // creatorId, refId, status, fee
subscriptions  // userId, plan, cycle, stripeId
```

Indexes that matter:
- Composite on `(formatTag, contentTag, regionId)` for search facets
- `tsvector` index on `displayName || bio` for FTS
- `pg_trgm` on `displayName` for fuzzy matching
- Denormalized `followersTotal` on `creatorProfiles` for sort-by-reach

---

## Files in This Bundle

- `README.md` — this file
- `CLAUDE.md` — drop into your project root; Claude Code reads it automatically
- `design-tokens.css` — all CSS variables, copy-pasteable into Tailwind config
- `prompts.md` — starter prompts for Claude Code
- `references/ManaMap Design Doc.html` — the full design doc with 9 wireframes
- `references/ManaMap Landing.html` — the waitlist landing page
- `references/styles.css` — base design system styles
- `references/landing.css` — landing-page-specific styles
- `references/Mtg Creator Ecosystem Platform Analysis And Roadmap.pdf` — original strategy doc this design was built from

---

## How to Use With Claude Code

1. Create a new project folder.
2. Copy `CLAUDE.md` and `design-tokens.css` to the project root.
3. Copy the `references/` folder as-is.
4. Run `claude` in the folder.
5. Use one of the prompts in [`prompts.md`](./prompts.md) to scaffold.

Claude Code will auto-load `CLAUDE.md` and treat it as persistent project context.

---

## What's NOT in This Bundle

- A working backend
- Real auth (Clerk/Supabase setup)
- The YouTube/Twitch/Bluesky integration code
- Live data — every number, name, and avatar in the mocks is illustrative
- Mobile-app source — mobile mocks are responsive web only
- Legal/ToS/privacy copy

---

## Production Checklist

### Required environment variables

Set every variable below in Vercel → Project → Settings → Environment Variables before deploying to Production.

```
# Database (Neon)
DATABASE_URL

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL

# Asset storage (Cloudflare R2)
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_BASE_URL

# Email (Resend)
RESEND_API_KEY
RESEND_AUDIENCE_ID          # audience ID for "manamap-waitlist"
RESEND_FROM_EMAIL           # e.g. hello@manamap.gg

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST    # defaults to https://us.i.posthog.com

# Error tracking (Sentry)
NEXT_PUBLIC_SENTRY_DSN
SENTRY_DSN                  # same value as above; used server-side
SENTRY_ORG                  # Sentry org slug (for source-map uploads)
SENTRY_PROJECT              # Sentry project slug
SENTRY_AUTH_TOKEN           # CI/build token for source-map uploads

# Rate limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# External APIs
YOUTUBE_API_KEY
TWITCH_CLIENT_ID
TWITCH_CLIENT_SECRET

# Admin access
ADMIN_EMAILS                # comma-separated, e.g. you@example.com,co@example.com

# App
NEXT_PUBLIC_BASE_URL        # canonical origin, e.g. https://manamap.gg
NEXT_PUBLIC_LAUNCHED        # set to "true" to flip out of pre-launch mode (see below)
```

### Launch flip: NEXT_PUBLIC_LAUNCHED

Default value is `false` (or omit the variable entirely). While `false`:
- A "Coming soon" banner is shown at the top of the landing page.
- The nav "Sign in" link points to `/sign-up` (directs early visitors to claim/waitlist).

When you're ready to soft-launch:
1. Set `NEXT_PUBLIC_LAUNCHED=true` in Vercel Environment Variables.
2. Trigger a redeploy (or the next push will pick it up automatically).
3. The banner disappears and "Sign in" now routes to `/sign-in`.

Signups (`/sign-up`) remain open in both states.

### Database migration

Run Drizzle migrations against the Neon production branch before the first deploy:

```bash
npx drizzle-kit push
```

Or, if using migration files:

```bash
npx drizzle-kit migrate
```

Verify the schema by opening the Neon console → Tables.

### Initial admin setup

1. Sign up with the email address you want as admin.
2. Add that email to the `ADMIN_EMAILS` environment variable (comma-separated for multiple).
3. Redeploy or wait for the next deployment.
4. Visit `/admin` to verify access.

### DNS

Point your domain at Vercel:
- Add the domain in Vercel → Project → Settings → Domains.
- At your DNS registrar, add the A/CNAME records Vercel provides.
- Vercel provisions a TLS certificate automatically.
- Set `NEXT_PUBLIC_BASE_URL` to the canonical HTTPS origin once DNS propagates.

### Resend — waitlist audience

- Audience ID is already set in `RESEND_AUDIENCE_ID`.
- To export the waitlist: Resend dashboard → Audiences → manamap-waitlist → Export CSV.
- Unsubscribed contacts are excluded from exports by default.

### Status page

Visit `/status` (admin-gated) to check DB connectivity, creator/event/store counts, and waitlist size in one place. Useful for the first few days after launch.

### Sentry source maps

`SENTRY_AUTH_TOKEN` must be set in Vercel for source maps to upload during builds. Generate a token at sentry.io → Settings → Auth Tokens with `project:releases` scope. The `withSentryConfig` wrapper in `next.config.ts` handles the upload automatically on Vercel (`VERCEL=1` is set by the platform).
