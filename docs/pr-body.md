## Summary

This draft PR rebuilds Hyderabad Metro Go as a modular, passenger-first static GitHub Pages application. It replaces the audited four-file DOM demo with stable station identities, explicit route logic, accessible semantic views, a Direction A Signage Ledger visual system, a Direction B route-stage strip, and Direction C mode-specific dark/Live Journey behavior.

## Included in this milestone

- Modular ES modules for data, route engine, store, views, map, persistence, accessibility, and routing.
- Static topology route planning with explicit ride and interchange edges.
- Deterministic route objectives for best available static topology, fewest changes, and accessible-route uncertainty.
- Separate `Parade Ground` and `JBS Parade Ground` station identities connected by explicit line relationships.
- Planner-first mobile and desktop compositions at the approved visual direction.
- Semantic numbered route stages for start, ride, change, and arrive.
- Schematic map companion with a complete textual network alternative.
- Ameerpet station-detail vertical-slice fixture visibly marked `DEMO / NOT VERIFIED`.
- Direction C dark Live Journey static companion entered from route results.
- English/Telugu-ready localization keys, visible focus, live announcements, reduced motion, high contrast, and versioned localStorage.
- Local app-shell manifest/service worker and GitHub Pages workflow gated by verification.
- Reproducible route, browser, responsive, semantic, and static checks.

## Data-honesty boundary

The current branch intentionally does not claim live arrivals, train positions, schedule durations, fare values, platform assignments, exits, facility availability, parking availability, accessibility equipment, or current service status. These remain unavailable until individually sourced and verified with URL, verification date, confidence, status, owner, refresh policy, and assumptions.

## Verification evidence

- `npm run verify` passes JavaScript syntax and route-engine smoke tests.
- Static QA passes semantic shell, local-only asset, legacy-architecture, reduced-motion, focus, and no-gradient checks.
- Browser smoke passes route results, explicit transfer stages, Live Journey static mode, station detail fixture, source dialog, Telugu locale, dark mode, and same-station validation.
- Responsive browser QA passes no horizontal overflow, named controls, labelled selects, `main`/`nav` landmarks, skip link, and reduced-motion state at 390×844, 768×1024, and 1440×900.
- Rendered screenshots were visually inspected at all three approved viewport sizes.

## Review notes

The visual direction was separately approved as Direction A — Signage Ledger, with Direction B limited to the semantic route-stage strip and Direction C limited to dark/high-contrast and Live Journey behavior. No high-fidelity UI was created before that approval.

## Merge constraint

This PR is draft-only. Do not merge into `main` until owner review, production data verification, accessibility review, deployment validation, and remaining implementation milestones are complete.
