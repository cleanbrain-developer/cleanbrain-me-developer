# ADR-0006: Root Page Becomes the Portfolio Front Door; Live Evidence Moves Inline

- Status: Accepted
- Date: 2026-09-28
- Deciders: cleanbrain.developer

## Context

ADR-0005 made `/` redirect straight to `/lab/relayhub`'s Live Monitoring dashboard, on the reasoning that a genuinely live system was a stronger front door than a static portfolio page, and that the former homepage content was still reachable at `/profile`.

The maintainer's follow-up review (a detailed UX/UI refinement spec) found the actual result read as "this site is a RelayHub monitoring console" rather than "this is a backend engineer's portfolio that happens to run a real, observable system." Reaching the live system also took one extra hop than necessary: `Header → Live → /lab (thin landing page) → "Open Live Monitoring" → /lab/relayhub`, even though RelayHub has been the only Live destination since ADR-0005.

The spec is explicit that the Live-first strategy itself should be **kept**, not reversed back to a static-only homepage — the fix is *where* the live evidence sits, not whether it exists on the front page.

## Decision

- `/` (`src/app/page.tsx`) is no longer a client-side `redirect()`. It is now real, static content: Hero (role + tagline, deliberately terse — the long `profile.summary` paragraph stays on `/resume`/`/experience` instead) plus a new `LiveSignal` component (`src/components/portfolio/live-signal.tsx`) showing real succeeded/DLQ/events-per-minute numbers and an abbreviated, real-node-name topology preview — then the former `/profile` content in order: Impact, Featured Projects, Engineering Focus, Selected Case Studies, Architecture snapshot, Resume/Contact.
- `LiveSignal` reuses `fetchRelayHubLiveObservability()`, `fetchTopology()`, and `openLiveActivityStream()` (all already exported from `src/lib/relayhub/{live-observability,live-topology}.ts`) for its data and connection status. It does **not** reuse `LiveTopology`'s stateful pulse/explosion animation engine — that stays untouched at `/lab/relayhub`, which remains the full, fully-animated console.
- `/profile` and `/lab` (`src/app/{profile,lab}/page.tsx`) both become the client-`redirect()` pattern ADR-0003 established for exactly this static-export trade-off — `/profile` → `/`, `/lab` → `/lab/relayhub` — so existing bookmarks/links to either keep working instead of 404ing, rather than deleting the routes outright.
- `src/components/layout/site-header.tsx`: the logo now links to `/` (was `/profile`); the nav item labeled "Live" and pointing at `/lab` is now "Live Systems" pointing directly at `/lab/relayhub`, removing the extra hop.
- A new `src/components/ui/` directory holds five small, local, shadcn-style presentational primitives (`Button`, `Badge`, `Card`, `Separator`, `Skeleton`) introduced alongside this change and used by the new home page and header — not an installed package, no new npm dependency, and no Radix (none of the five need open/close state or focus trapping). Existing pages (`/resume`, `/contact`, `/projects`, `/case-studies`, `/experience`, `/architecture`) are not retrofitted to use them yet; that is deferred, tracked in `docs/status/current-state.md`'s "Next" section.

## Consequences

### Positive

- The root page now demonstrates *both* identity and evidence in the first viewport, instead of evidence alone — directly addresses the "reads as a monitoring console" finding.
- Removes ADR-0005's own documented cost ("anyone who bookmarked `/` for the portfolio narrative now lands on the dashboard instead") without giving up the live evidence that motivated ADR-0005 in the first place.
- `/` no longer needs the client-redirect trade-off at all (crawlers/no-JS clients now see real content in `<head>` *and* `<body>` immediately) — a net simplification, not just a relocation. `/profile` and `/lab` still need it, but only as thin compatibility redirects for old links, which is a smaller trade-off than the whole homepage carrying it.
- `LiveSignal` is deliberately independent of `LiveTopology`'s ~500-line stateful animation engine, so this change carries no regression risk to `/lab/relayhub`, which had two real production bugs fixed in it this same week (DLQ count resync, replay-missile origin) — those fixes are verified untouched.

### Costs and risks

- Two live subscriptions can now be open at once if a visitor has `/` and `/lab/relayhub` in different tabs (each opens its own `EventSource` to `relayhub-java`'s `/api/live/stream`) — accepted as a normal consequence of two independent live views existing; relayhub-java's SSE endpoint is not a scarce resource this site controls capacity for.
- `LiveSignal`'s topology preview shows real node names but not real-time pulse animation (see Decision) — a visitor comparing it side-by-side with `/lab/relayhub` could notice the preview is "less live" than the full console. Accepted: the spec explicitly permits "reuse or abbreviate," and duplicating the full animation engine's regression surface for a homepage preview was judged not worth the risk this same week that engine had two real bugs fixed in it.
- The five new `src/components/ui/` primitives are not yet used anywhere outside the new home page and header — existing pages keep their hand-written Tailwind class strings until the follow-up visual-hierarchy pass (tracked as "Next" work, not abandoned).

## Alternatives considered

### Extract `LiveTopology`'s shared internals into a reusable engine, render both a "full" and "compact" mode from it

More elegant, more code reuse. Rejected for this change: `live-topology.tsx` is a working, twice-recently-bug-fixed file, and refactoring its internals to serve a new consumer carries real regression risk to the production console for a homepage decoration's benefit. Revisit if a third consumer of the same animation ever appears — one new independent consumer doesn't yet justify the extraction.

### Keep `/` as a redirect, just point it at a new combined page instead of `/lab/relayhub`

Would have avoided touching `/profile`/`/lab`'s routing at all. Rejected: `output: "export"` (ADR-0003) means a redirect earns nothing here — there's no server-side redirect to speed up, and it costs real content visibility to crawlers/no-JS clients for no benefit once `/` has real content of its own to serve directly.

## Update (2026-09-29): Radix arrives, for the RelayHub activity drill-down

This ADR's "Costs and risks" anticipated that the five `src/components/ui/` primitives (`Button`/`Badge`/`Card`/`Separator`/`Skeleton`) would stay Radix-free "until whichever later phase needs a Dialog/Sheet." That phase is the RelayHub Live activity drill-down (see ADR-0004's own 2026-09-29 Update — including a same-day detour where a first attempt at this was built, found to depend on a `relayhub-java` endpoint that was admin-gated for a real prior reason, and reverted before shipping; the maintainer then reopened that endpoint on `relayhub-java`'s side, which is what actually unblocked this): clicking a delivery row in `/lab/relayhub`'s Recent Activity table now opens a `Sheet`.

- Added `@radix-ui/react-dialog` as this repository's first Radix dependency, wrapped as `src/components/ui/sheet.tsx` (Root/Trigger/Portal/Overlay/Content/Close/Title/Description, restyled to this site's tokens) — the same shadcn-style "copy the primitive in, don't install the whole library" approach the first five primitives used, just with Radix underneath this one for the focus-trap/Escape/aria wiring a slide-in panel genuinely needs.
- No other primitive gained a Radix dependency in this change — `Button`/`Badge`/`Card`/`Separator`/`Skeleton` are unchanged. The next Radix-based addition (if any) happens the same way: only when a concrete page needs it.

## Update (2026-10-07): `/lab` becomes a real multi-service index again

This ADR's Decision made `/lab` a thin `redirect()` straight to `/lab/relayhub` "removing the extra hop," with that file's own code comment anticipating exactly this reversal: *"If a second Live system is ever added, this becomes a real overview page again rather than a redirect."* That trigger has arrived — per `cleanbrain-me-infra`'s README ("developer.cleanbrain.me subdomain namespace," citing `relayhub-java`'s own ADR-0002), RelayHub is planned to scale out to language siblings (`relayhub-<lang>`, e.g. a future `relayhub-node`) — separately deployed instances of the same product and API contract, not different products. The maintainer asked that `/lab` stop reading as "this site is a RelayHub monitoring console" even while RelayHub remains the only real entry today.

- New `src/content/live-services.ts`: a small registry (`LiveService { slug, name, language, baseUrl, description, status }`) — the single source of truth for every Live system this site shows data from. One entry today (`relayhub`, Java, `status: "live"`); a future sibling is a new entry with its own slug, never a rename of this one (so the existing `/lab/relayhub` URL never breaks).
- `src/lib/relayhub/{live-topology,live-observability}.ts`: the module-level `RELAYHUB_JAVA_BASE_URL` constant is gone — every exported fetch/stream function now takes a `baseUrl: string` parameter instead. This is the actual generalization: a future sibling needs only a new registry entry, not new fetch logic, since siblings share the same REST/SSE contract `relayhub-java` already exposes. Wire shapes/types are unchanged.
- `LiveTopology`/`LiveDashboard`/`ActivityDetailSheet` now take a `service`/`baseUrl` prop instead of hardcoding the one instance; their RelayHub-java-specific display strings (`"relayhub-java — Live Monitoring"`, the external console link, the "Connecting to…" loading text) became service-driven. The on-diagram "RelayHub" hub label stays literal text — it is the product name, still accurate for any language instance.
- `src/app/lab/[slug]/page.tsx` (new, `generateStaticParams` over `liveServices`, same `notFound()` pattern as `/projects/[slug]`/`/case-studies/[slug]`) replaces the old hand-written `src/app/lab/relayhub/page.tsx`. Because the registry's slug for the existing instance is still `"relayhub"`, this generates the exact same `/lab/relayhub` static file — no link breaks.
- `src/app/lab/page.tsx` is a real index page now: a grid of `LiveServiceCard`s (new `src/components/lab/` folder, deliberately not under `relayhub/` since this layer is generic). Each card shows name, language, status, and a small ambient `LivePulse` animation — purely decorative Tailwind `animate-ping`/`animate-pulse` dots, **not** a reuse of `LiveTopology`'s pulse/explosion engine and **not** data-driven, for the same regression-avoidance reasoning this ADR already applied to `LiveSignal`'s homepage preview (see "Alternatives considered," original decision). A `"coming-soon"` entry (none exist yet) renders non-clickable instead of linking out.
- `site-header.tsx`'s "Live Systems" nav item now points at `/lab` (was `/lab/relayhub`) — the one place that should generalize, since it's the primary global entry point. Every other existing direct `/lab/relayhub` reference (`/contact`'s "RelayHub Live Monitoring" link, `/projects`'s "Open RelayHub Live" CTA, the homepage hero button) is unchanged — each is already explicitly RelayHub-named in its own link text, so linking straight to the RelayHub detail page from there is still correct.
- `LiveSignal` (homepage) now reads `liveServices[0].baseUrl` instead of its own second hardcoded URL constant — same data, one source of truth instead of two copies that could drift.

This is a continuation of the exact decision this ADR already made and explicitly flagged as revisitable, not a new ADR.
