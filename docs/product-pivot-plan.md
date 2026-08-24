# Rethinksoft product pivot

## Current architecture

- Astro 7 server-rendered site with Node locally and Vercel in production.
- Shared `BaseLayout.astro` owns metadata, navigation, footer, fonts, and global styles.
- The homepage is a Foundry/Founder Sprint marketing page built from static Astro data.
- Product research is stored as one JSON record per product in `data/apps/` and rendered through `/directory` and `/:slug`.
- SQLite currently stores waitlist emails, votes, private creator submissions, and community product listings.
- Vanilla JavaScript in `public/site.js` provides navigation, filtering, animations, forms, copying, sharing, and voting.
- There is no authentication, founder account system, startup profile, persistent goal system, connected analytics, payment integration, or AI service yet.

## Feature migration matrix

| Current feature | New role | Action | Main files |
| --- | --- | --- | --- |
| Founder Sprint homepage | Software Entrepreneurship OS homepage | Modify | `src/pages/index.astro`, homepage styles |
| Sprint application | Founder onboarding | Repurpose | `src/pages/index.astro`, `src/pages/start.astro`, waitlist and founder APIs |
| Growth Score presentation | Rethink Score V1 | Keep and broaden | homepage, founder dashboard, database |
| Weekly Sprint plan | Weekly founder goals | Repurpose | `src/pages/sprint-setup.astro`, founder dashboard |
| Sprint setup guide | Founder OS onboarding help | Keep and rename later | `src/pages/sprint-setup.astro` |
| Product blueprint directory | Opportunity discovery | Repurpose | `src/pages/directory.astro`, `data/apps/`, opportunities route |
| Product detail prompts | Build plan and source foundation | Keep | `src/pages/[slug].astro` |
| Company directory | Market research | Keep | `src/pages/company-directory.astro` |
| RS Deals | Contextual founder savings | Keep and expand in P1 | `src/pages/deals.astro` |
| Community showcase | Founder launch evidence | Keep | `src/pages/showcase.astro` |
| Waitlist | Lightweight lead capture | Keep | `src/pages/api/waitlist.ts` |
| Funding language | Advanced investor-readiness layer | Deprecate from primary journey | homepage, partner and editorial copy |
| Foundry selection framing | Optional later-stage program | Deprecate from primary navigation | layout, homepage, Sprint pages |

## New information architecture

1. Discover opportunities
2. Validate an idea
3. Create a business profile
4. Build with existing AI coding tools and source foundations
5. Launch with a clear checklist
6. Run weekly customer acquisition goals
7. Track a Rethink Score and next milestone
8. Use contextual deals and optional growth support
9. Prepare for funding only after traction

## Routes

- `/` new entrepreneurship OS homepage
- `/start` founder onboarding and business profile creation
- `/opportunities` opportunity discovery and validation entry point
- `/founder/[id]` private Founder OS workspace
- `/directory` existing product blueprint library
- `/:slug` existing product build plan
- `/deals` existing deals surface, contextual recommendations in P1
- `/sprint-setup` retained as a supporting 30-day execution guide

## Data model changes

- `founder_businesses`: private startup profile, stage, customer, business model, baseline metrics, score, and access token hash.
- `founder_goals`: weekly actions with category, status, and ordering.
- `founder_checkins`: future weekly progress snapshots.
- No destructive migration. Existing tables remain unchanged.

## Reusable pieces

- Foundry visual system, story cards, score bars, proof strip, CTA patterns, motion, and responsive layout.
- Product JSON library, market categories, prices, prompts, and open-source references.
- Existing SQLite bootstrap and server routes.
- Existing form handling, reveal animations, filters, and mobile navigation.
- Sprint weekly-plan language as the foundation for Founder OS.

## New P0 components

- Entrepreneurship journey section
- Opportunity cards with deterministic validation summaries
- Founder onboarding form
- Private founder workspace
- Rethink Score breakdown
- Weekly goals and next-action recommendations
- Lightweight cookie-based workspace access without pretending a full account system exists

## Delivery priority

### P0

Homepage positioning, founder onboarding, business profiles, opportunity discovery, validation summaries, Founder OS workspace, weekly goals, Rethink Score V1, and growth recommendations.

### P1

Prebuilt business catalog, launch workflow, Stripe, domains, GitHub, analytics, and contextual deals.

### P2

Automated software generation, SEO/AEO execution, outbound automation, managed growth, investor matching, and investment eligibility.

### P3

Rethinksoft Capital, progressive funding, investment underwriting, a developer marketplace, and the business-to-founder distribution network.

## Risks and technical debt

- Vercel's local SQLite path is ephemeral, so production founder data requires durable storage before a public launch.
- Authentication is not present. P0 uses a private browser cookie per workspace, which is appropriate for validation but not a replacement for accounts.
- Opportunity validation is rules-based in P0. A real model-backed analysis needs an AI provider, evaluation prompts, usage controls, and observability.
- Several legacy pages still use Foundry language and should be migrated gradually after the primary experience proves useful.
- Global CSS is split across many historical stylesheets. The pivot should reuse them now and consolidate only after product validation.

## Smallest shippable pivot

Ship a new homepage, an opportunity browser, a founder onboarding flow, and a private Founder OS workspace that produces a practical score, five weekly goals, and one growth recommendation. This makes the new promise real without building a proprietary coding engine or removing useful existing work.
