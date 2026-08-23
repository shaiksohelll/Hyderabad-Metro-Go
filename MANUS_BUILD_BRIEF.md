# Manus build brief — Hyderabad Metro Go 2.0

## Mission

Build an original, high-confidence Hyderabad Metro journey experience. Do not reskin or incrementally edit the legacy three-column interface. Treat the legacy implementation only as a historical reference.

## Product direction

**Hyderabad Future Transit:** map-led, calm, precise, bilingual, accessible, and unmistakably local without tourist clichés. Use pearl-white surfaces, midnight transit blue, and the operational Red, Blue, and Green line colors.

## Non-negotiable architecture

1. Semantic HTML and progressive enhancement.
2. Modular vanilla JavaScript with separate data, domain, state, service, view, and motion responsibilities.
3. CSS custom-property design tokens and responsive layouts with no essential content hidden.
4. Explicit station/platform and transfer modeling. Parade Ground and JBS Parade Ground are separate station identities connected by a transfer edge.
5. No fare, facility, timing, platform, parking, live-status, or accessibility claim without a source and verification date.
6. GSAP only for orchestrated route and state transitions. CSS/WAAPI for simple micro-interactions. Respect reduced motion.
7. Blender/Three.js assets must be lazy-loaded, optional, and absent from the critical planning path.

## Core screens

- Home/network canvas
- Journey planner
- Route comparison
- Stop-by-stop journey
- Station detail sheet
- Saved/recent journeys
- Settings: theme, language, motion, accessibility
- Offline, empty, loading, error, and stale-data states

## Acceptance criteria

- Complete keyboard operation
- Visible focus indicators
- 44×44 px minimum interactive targets
- WCAG 2.2 AA contrast target
- English and Telugu UI architecture
- No information communicated by color alone
- No page-level horizontal scrolling at 390 px
- No clipped planner or result content
- Reduced-motion behavior for every animation
- Deterministic routing tests for all line combinations
- A visible source/status notice for unverified data
- Mobile-first PWA behavior

## Delivery sequence

1. Verify and normalize official network data.
2. Stabilize the route engine and tests.
3. Complete route planning and station-detail flows without animation.
4. Apply the design system.
5. Add functional motion.
6. Add optional 3D assets after performance review.
7. Run accessibility, responsive, performance, and offline QA.

## Do not

- Reuse the old three-column layout.
- Mix Bootstrap and Tailwind.
- add multiple overlapping animation libraries.
- fabricate real-time, fare, facility, or platform data.
- copy another transit product pixel-for-pixel.
- optimize visual drama ahead of route clarity.
