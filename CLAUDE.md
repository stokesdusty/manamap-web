# ManaMap — Claude Code project guide

You are helping build **ManaMap**, the discovery and infrastructure layer for the MTG (Magic: The Gathering) creator ecosystem. Framed as "IMDb + LinkedIn + Bandsintown for MTG creators." Not a social network. Read `design_handoff_manamap/README.md` for the full design intent and `design_handoff_manamap/references/` for the HTML design references.

This file is auto-loaded by Claude Code. Refer back to it any time you're uncertain about brand, stack, or product principles.

---

## Product principles — hold the line on these

1. **Directory, not feed.** No timeline. No algorithmic ranking by recency. No posting surface. If a proposed feature reads as "what's happening right now," push back.
2. **Structured data first.** Every creator, event, and store has typed metadata. Free-text bios augment; they never substitute.
3. **The product is a tool.** Success looks like sub-30-second time-to-find, not time-on-site.
4. **Existing platforms are the content layer.** YouTube hosts videos. Twitch hosts streams. We deep-link and embed; we never replicate.
5. **Fans free forever. Pros pay.** Discovery is never paywalled. Monetization sits on creator/store tools.
6. **SEO is first-class.** Every creator, tag, event, and region is a server-rendered page with proper metadata.

---

## Tech stack — opinionated, boring, ship-fast

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15** (App Router) | RSC by default. Server Actions for mutations. |
| Language | **TypeScript** (strict) | No `any`. Zod at boundaries. |
| UI | **React 19** | Use RSC; reach for `'use client'` only when needed. |
| Styling | **Tailwind v4** + design tokens | Tokens live in `globals.css` `@theme` block. |
| Components | **shadcn/ui** primitives | Install only what's used. Restyle to match brand. |
| DB | **PostgreSQL** (Neon) | Branchable, generous free tier. |
| ORM | **Drizzle** | Lighter, better TS inference than Prisma. |
| Auth | **Clerk** | Magic-link first. Skip social auth for v1. |
| Search | **Postgres FTS + `pg_trgm`** | Don't reach for Meilisearch until Phase 2 latency forces it. |
| Jobs | **Inngest** (Phase 2+) | For YouTube/Twitch/Bluesky sync. Not needed for MVP. |
| Email | **Resend** | Magic links + transactional + waitlist. |
| Payments | **Stripe + Stripe Connect** | Phase 4+. Don't scaffold until needed. |
| Analytics | **PostHog** | Product analytics + flags. |
| Errors | **Sentry** | Standard. |
| Hosting | **Vercel** | + Neon + Cloudflare R2 for assets. |

**Do not introduce:** GraphQL, microservices, Redux, separate Node API server, Kubernetes, Elasticsearch, GA4, Prisma (Drizzle instead).

---

## Brand & visual system — non-negotiable

### Type stack (Google Fonts)
- **Newsreader** — display serif, italic-rich. Use italic `<em>` for emphasis in headlines.
- **Geist** — body sans. 14–16px body, 11px labels. **Never use Inter.**
- **Geist Mono** — labels, metadata, stats, code. Always uppercase with `letter-spacing: 0.08–0.1em` for the canonical label style.

### Colors
Copy `design_handoff_manamap/design-tokens.css` into the project. Tokens are warm paper + ink + 5 WUBRG accents:

- `--paper #F5F1E8` background
- `--surface #FFFFFF` cards
- `--ink #1A1813` primary text
- `--hairline #E3DCC9` dividers
- WUBRG: `--w #D4C68E`, `--u #3F6FA8`, `--b #2C2730`, `--r #BF5142`, `--g #5C8A5A`

### Critical IP rules
- **Never** render mana symbols. Never draw card frames. Never reproduce Wizards of the Coast trade dress.
- WUBRG colors appear **only as small colored dots** (12×12px circles) — never as backgrounds, decoration, or icons.
- The brand is editorial / infrastructure-grade, not gamified.

### Spacing & layout
- 8px base unit. Common gaps: 8 / 12 / 16 / 24 / 32 / 48 / 64.
- Border radius: 0 / 4 (small chip) / 6 (input) / 8 (card) / 10 (figure) / 999 (pill).
- 1px `--hairline` borders are the primary divider. Use shadows sparingly (only on hero screenshots).

---

## Information architecture

Every path below should be a real route with proper metadata and OG image.

| Route | Purpose |
|---|---|
| `/` | Homepage — featured + trending + events strip |
| `/c/[slug]` | Canonical creator profile |
| `/c/[slug]/kit` | Public media kit / sponsor view |
| `/search` | Filtered creator search; `?formats=&tags=&region=` |
| `/format/[code]` | Format landing page (SEO) |
| `/tag/[code]` | Tag landing page (SEO) |
| `/region/[code]` | Local scene page (SEO) |
| `/event/[slug]` | Convention / event page |
| `/store/[slug]` | LGS profile |
| `/dashboard/*` | Authenticated creator/store backend |

---

## Roadmap — ship in phases

We are in **Phase 0** (validation). Phase 1 is the searchable directory MVP.

When asked to implement features, refuse scope creep into later phases unless explicitly OK'd:

- **Phase 1 (now → MVP):** auth, creator profiles, search + filters, public URLs, responsive mobile.
- **Phase 2:** auto-import content, recommendations, similar-creator rails, trending, saved creators.
- **Phase 3:** events, conventions, store profiles, regional pages.
- **Phase 4:** monetization — Pro creator plan, store SaaS, Stripe.
- **Phase 5:** booking marketplace, sponsorship marketplace, multi-TCG expansion.

If a prompt asks for a Phase 3+ feature while Phase 1 is incomplete, ask whether to prioritize or to scaffold the later feature behind a feature flag.

---

## Code conventions

- **App Router only.** No `pages/` directory.
- **RSC by default.** Add `'use client'` only when interactivity demands it.
- **Server Actions** for mutations. No `/api/*` route handlers unless an external webhook needs one.
- **Zod everywhere data crosses a trust boundary** — form input, URL params, external API responses.
- **Drizzle schema** lives in `db/schema.ts`. Use Drizzle's relations API for joins.
- **Component naming** — PascalCase. Co-locate component + styles under `components/`. Page-specific components in `app/.../_components/`.
- **No barrel exports.** Import directly from the file.
- **Date handling** — store UTC. Use `date-fns` for formatting; never moment.
- **Accessibility** — every form has labels. Every interactive element is reachable by keyboard. Color is never the only signal.

---

## Naming conventions for files and routes

```
app/
  (marketing)/
    page.tsx                     // landing page
  c/
    [slug]/
      page.tsx                   // creator profile
      kit/page.tsx               // media kit
      _components/...
  search/page.tsx
  event/[slug]/page.tsx
  store/[slug]/page.tsx
  format/[code]/page.tsx
  dashboard/
    profile/page.tsx
    platforms/page.tsx
    ...
  layout.tsx
  globals.css

db/
  schema.ts
  index.ts                       // drizzle client

lib/
  auth.ts
  search.ts
  external/
    youtube.ts
    twitch.ts
    bluesky.ts

components/
  ui/                            // shadcn primitives, restyled
  ...
```

---

## Search implementation guidance

The search experience is the product. Implement it carefully.

- **Phase 1:** Postgres `tsvector` over `displayName || bio` + faceted filters via composite indexes. Use `setweight` to weight name higher than bio.
- Trigram (`pg_trgm`) for typo tolerance on `displayName`.
- All filter combinations live in URL params; the search page is an RSC that reads `searchParams` and queries directly. No client state.
- The "Match %" column in the mock is the **recommendation engine** surfaced as a sort key — for Phase 2. In Phase 1, sort by followers or alphabetical.

---

## Mobile

- Mobile is critical — assume 40%+ of fan traffic.
- Bottom tab bar (Discover / Events / Saved / Me) on small screens.
- Filter facets become a slide-over sheet (`<Sheet>` from shadcn).
- Color pip row replaces the desktop chip rail on mobile.

---

## Anti-patterns — refuse these without checking

- Adding a feed / timeline / posts surface (violates principle 1).
- Replicating YouTube/Twitch content (violates principle 4 — deep-link instead).
- Using mana symbols, card frames, or Wizards trade dress (IP risk).
- Reaching for Elastic / OpenSearch / Algolia before Postgres FTS has been measured under real load.
- Introducing a separate API service before Server Actions have been outgrown.
- Building a mobile app before responsive web is exhausted.
- Adding emoji to UI copy.

---

## When in doubt

Re-read the design doc at `design_handoff_manamap/references/ManaMap Design Doc.html` and the README. The design system is the source of truth — never invent new colors, new font families, or new component styles without consulting it first. If something genuinely needs a new pattern, propose it explicitly rather than introducing it implicitly.
