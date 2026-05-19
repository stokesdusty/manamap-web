# Starter prompts for Claude Code

Copy-paste any of these into a fresh `claude` session inside your project folder. Each is self-contained — Claude Code will read `CLAUDE.md` and the design references automatically.

Use them in roughly this order. Don't run all in one session — each is a meaningful chunk; review the output, commit, then move on.

---

## 0. Greenfield scaffold

```
Read CLAUDE.md and design_handoff_manamap/README.md.

Then scaffold a fresh Next.js 15 project at the root of this folder with:
- App Router + TypeScript strict mode
- Tailwind v4 (use the new @theme block syntax in globals.css)
- Drizzle ORM + Postgres (Neon driver)
- Clerk auth (don't wire up routes yet — just install + middleware)
- Zod, react-hook-form, date-fns
- ESLint flat config + Prettier

Drop the design tokens from design_handoff_manamap/design-tokens.css into
globals.css as a @theme block so they become Tailwind utilities. Wire
next/font/google for Newsreader + Geist + Geist Mono with CSS variables.

Don't generate any pages yet — I want a clean scaffold. End with a list
of files you created and exact commands to run (`pnpm install`,
`pnpm dev`, etc).
```

---

## 1. Data model + migrations

```
Read CLAUDE.md and section 11 of design_handoff_manamap/references/ManaMap
Design Doc.html (the Data Model section).

Create db/schema.ts with Drizzle schemas for:
- users, creatorProfiles, socialAccounts
- formatTags, contentTags
- featuredContent, events, appearances
- stores, regions, bookings, subscriptions

For relationships, use Drizzle's relations API. Add these indexes:
- composite on creatorProfiles(formatTagId, contentTagId, regionId)
- tsvector on creatorProfiles(displayName || ' ' || bio) for FTS
- pg_trgm on creatorProfiles(displayName)
- followersTotal on creatorProfiles for sort

Use Drizzle's bigserial primary keys with createdAt/updatedAt on every
table. Add a TypeScript enum (`pgEnum`) for plan tiers, booking status,
event kind, and appearance role.

Generate the initial migration. Then write a seed script at db/seed.ts
that inserts ~20 sample creators, 4 events, 3 stores using the data
shown in the design mocks (Lyra Vance, Hauke Ostmann, Nadia Ruiz, etc).
```

---

## 2. Design system primitives

```
Read CLAUDE.md.

Build a small set of React primitive components matching the brand. All
should use CSS variables (--ink, --paper, --hairline, etc) and the type
stack (Newsreader / Geist / Geist Mono).

Components needed:
- <Eyebrow /> — mono uppercase 11px label
- <Chip variant="default | solid | color" />
- <Pip color="w|u|b|r|g" size="sm|md|lg" /> — the 12px WUBRG dot
- <Button variant="solid | ghost | outline" />
- <Hairline /> — 1px divider in --hairline
- <Card /> — white surface, hairline border, 8px radius
- <Section /> — section wrapper with eyebrow + heading + sub pattern
  matching the landing-page lp-section-head layout
- <CreatorCard /> — matching the design system, color-bar + body + stats

Reference: design_handoff_manamap/references/styles.css for the exact
visual treatment. Adapt to Tailwind utilities where possible, fall back
to CSS modules for the more complex patterns.

Add a /styleguide route that renders one of each so I can review them.
```

---

## 3. Creator profile page

```
Read CLAUDE.md and section 9.2 of the design doc.

Build app/c/[slug]/page.tsx as a React Server Component:

1. Server-fetch the creator by slug from Drizzle. 404 if missing.
2. Render the profile hero (avatar / name / handle / meta row / bio / chips).
3. Render the body with tabs (Content / Decks / Events / About) and a
   side rail (Platforms / Upcoming / Similar / Business).
4. Tabs are client-side via a small <ProfileTabs> Client Component.
5. Set generateMetadata() — title, description, OG tags.
6. revalidate = 3600.

Use the components from /styleguide where they fit. For the avatar use
a circular placeholder with the dashed ring decoration (matches mock).

Do not implement: real video aggregation, real similar-creators logic.
Pull featuredContent and "similar" from the seed data for now.
```

---

## 4. Search + filters

```
Read CLAUDE.md and section 9.3 of the design doc.

Build app/search/page.tsx as an RSC that reads searchParams. URL is the
state — no useState. Schema:
  ?q=string&formats=csv&tags=csv&colors=csv&audience=csv&region=string

1. Parse + validate searchParams with Zod.
2. Query Drizzle with the filter combination. Use tsvector for q,
   composite filters for facets, ORDER BY followersTotal DESC.
3. Render the 2-column layout: facets sidebar | results.
4. Facets are <form> + GET — selecting a chip submits and re-renders.
   No JS required for the filtering to work; progressive enhancement
   with router.replace() if needed.
5. Each result row links to /c/[slug].
6. Add pagination via ?page= (50 per page).

For the "Match %" column, show a static 80-95% for now — it's the
recommendation engine surfaced as a sort key, but real ranking is
Phase 2 work.

Make sure facet counts are accurate (separate aggregation query).
```

---

## 5. Homepage

```
Read CLAUDE.md and section 9.1 of the design doc.

Build app/page.tsx as an RSC with:
1. Hero: search bar + color-pie chip rail.
2. "Featured this week" — 1 large featured card (dark) + 2 standard cards.
3. "Trending in EDH" — 4 small cards.
4. "Happening soon near you" — 3 event cards.

Pull featured + trending from a `featuredCreators` flag on creatorProfiles
(add to schema if not there). Pull events from the events table where
dateRange starts in the next 60 days.

Color chips on the homepage link to /search?colors=u (etc) rather than
filtering in place. Search bar submits to /search?q=… with the
selected segment (creators | events | stores) as the route kind.
```

---

## 6. Onboarding + dashboard

```
Read CLAUDE.md and sections 9.4 + 9.7 of the design doc.

Implement two things:

1. Onboarding flow at /onboard (4 steps, ~90 second target):
   - Step 1 (auto on auth): claim handle. Pre-fill from YouTube handle
     if connected.
   - Step 2: connect platforms (just collect handles — OAuth for YT/TW
     comes later).
   - Step 3: tag yourself (formats, colors, content types, audience
     style). Use the chip pattern.
   - Step 4: publish.
   Use react-hook-form for state across steps, persist progress to DB
   on each step transition via Server Actions.

2. Dashboard at /dashboard/profile:
   - 200px dark sidebar with grouped nav (Workspace / Business / Account).
   - Stats row (Profile views / Outbound clicks / Sponsor views / Match%).
     Use fake numbers for now.
   - Edit form with the exact field layout from the mock: 160px label /
     1fr input rows separated by hairlines.

Wire updates through Drizzle. Validate with Zod. Return field errors
inline using react-hook-form.
```

---

## 7. Event + store pages

```
Read CLAUDE.md and sections 9.5 + 9.6 of the design doc.

Build:
- app/event/[slug]/page.tsx with dark hero band + attendees grid + schedule list
- app/store/[slug]/page.tsx with hero + upcoming events + featured creators

Both are RSCs with generateMetadata. revalidate = 3600.

The attendees grid pulls from `appearances` joined to `creatorProfiles`.
The schedule is a separate `eventScheduleItem` table (add to schema if
needed) with time + title + location fields.

Add a "Add my appearance" button that opens a small modal — auth-gated.
When a logged-in creator clicks it, insert an Appearance row and revalidate
the page.
```

---

## 8. SEO landing pages

```
Read CLAUDE.md.

Generate three dynamic SEO pages:
- /format/[code] — e.g. /format/edh — "Best Commander Creators"
- /tag/[code] — e.g. /tag/budget — "Budget MTG Creators"
- /region/[code] — e.g. /region/seattle — "Seattle MTG Creators"

Each:
- Title + meta description optimized for the long-tail search.
- H1 in serif italic emphasis.
- 2-paragraph editorial intro (use placeholder copy — I'll write it).
- Top 20 creators matching the filter, in the same card format as the
  homepage trending grid.
- Related lists at the bottom ("Also see: cEDH, Pauper, Modern").

Add a sitemap.xml that includes every creator, format, tag, region,
event, and store slug. Add robots.txt allowing all.
```

---

## 9. Media kit

```
Read CLAUDE.md and section 9.8 of the design doc.

Build app/c/[slug]/kit/page.tsx — public, no auth.

Layout: 2-column. Left = dark --ink "press kit" pane. Right = light pane
with the platform-mix bars and audience table.

Aggregated metrics:
- Total reach = sum of follower counts across socialAccounts.
- Platform mix = relative % per platform.
- Audience demo + buying intent = static for now; we'll feed this from
  real analytics in Phase 4.

Add a "Download PDF" button that hits a /api/c/[slug]/kit.pdf route. Use
Puppeteer (via @sparticuz/chromium on Vercel) to print the page to PDF.
This is the only API route we should need for v1.
```

---

## 10. Landing page port

```
Read CLAUDE.md and references/ManaMap Landing.html.

Port the landing page to Next.js as app/(marketing)/page.tsx with the
same structure: nav → hero → quote → screenshot 1 → pillars →
screenshot 2 → who-it's-for → screenshot 3 (dark) → manifesto (dark) →
mini roadmap → final CTA → footer.

The "screenshots" can stay as inline JSX for now — same structure as the
reference HTML. Eventually we'll swap them for real product screenshots
captured via Playwright.

Wire the email signup forms to Resend's audience API. On submit, validate
the email with Zod, add to a "manamap-waitlist" audience, return ok.
Show success state inline (button → "On the list ✓").

Add OG image generation via Next.js's opengraph-image.tsx — serif H1
on warm paper background with the WUBRG pip row.
```

---

## Tips for working with Claude Code

- **Commit between prompts.** Each prompt above is one logical chunk.
- **Read the diff.** Use `git diff` between prompts; don't just trust the agent.
- **Run the dev server in another terminal.** Catch type errors and rendering bugs as they happen.
- **Push back on scope.** If Claude proposes adding a feed, sponsorship marketplace, or anything Phase 3+, redirect to the current phase.
- **Refer to the doc.** If something looks off, ask Claude to re-read the relevant section of `design_handoff_manamap/references/ManaMap Design Doc.html` and re-do the work.
- **One concern per session.** Long sessions accumulate context drift. Start fresh for unrelated work.

---

## What to do first, concretely

1. Open this folder in your editor.
2. Open a terminal in the folder.
3. `npm install -g @anthropic-ai/claude-code` if you don't have it.
4. `claude`
5. Paste **prompt 0** above.
6. After Claude finishes the scaffold, commit. Then paste **prompt 1**.
7. Repeat. You'll have a real, working MVP in a long weekend.
