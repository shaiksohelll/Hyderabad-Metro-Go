# Hyderabad Metro Go — Corrected QA Report

## Scope

This report covers the correction pass for PR #3 on `manus-1.6/hyderabad-metro-go-rebuild`. The branch remains draft-only and `main` is not modified. The correction pass addresses project-subpath hosting, refreshable static routes, authoritative station-list reconciliation, exact transfer-edge assertions, route-derived schematic geometry, latest-state rendering, accessibility semantics, unsupported claims, pull-request CI, and reviewed screenshots.

## Verification matrix

| Check | Result | Evidence |
|---|---|---|
| JavaScript syntax | PASS | `npm run check` |
| Route-engine and exact-edge tests | PASS | `npm run test:route` |
| Project-subpath/static-host fallback | PASS | `npm run test:static-host` |
| Browser smoke | PASS | `npm run test:browser` |
| Responsive/accessibility browser QA | PASS | `npm run test:browser-qa` |
| Pull-request CI trigger | PASS | `.github/workflows/pages.yml` includes `pull_request` |
| Legacy CDN and retired-file check | PASS | `hmg_static_qa.py` |
| Whitespace/error check | PASS | `git diff --check` |
| Visual state review | PASS | 30 PNG captures and three contact sheets |

## Hosting and URL correction

All app assets use `/Hyderabad-Metro-Go/` in the document shell, manifest, service worker cache, and service-worker registration. Runtime route construction uses the same base through `src/config.js`. `404.html` contains the project-subpath shell, allowing GitHub Pages to serve the application shell for refreshes of `/Hyderabad-Metro-Go/plan`, `/Hyderabad-Metro-Go/map`, and `/Hyderabad-Metro-Go/stations/{id}`. The static-host test verifies the project base, module asset, manifest scope, service-worker base, and deep-link fallback.

## Network and route correction

`Osmania Medical College` is restored to the Red Line station identity list and is included in the stable-ID line order. `Parade Ground` is a Blue Line station identity and `JBS Parade Ground` is a separate Green Line identity. The unsupported direct Parade Ground-to-JBS Parade Ground transfer edge is not inserted into the graph. The route test asserts that exact edge absence and validates the supported graph path rather than treating the two display names as one station. Ameerpet and MG Bus Station transfer edges are present with provenance and `pending-verification` status; the route result surfaces that status instead of implying a confirmed transfer path.

The schematic map reads `lineOrders` from the same data module used by the route graph. Its coordinate functions align only Ameerpet and MG Bus Station as known shared anchors. The tests assert those alignments and assert that Parade Ground and JBS Parade Ground do not overlap. The map’s description states that exact Parade Ground transfer geometry remains pending verification.

## State and accessibility correction

Animation-frame rendering now stores the latest pending state and renders that state after batching; intermediate dispatches cannot leave the DOM stale. Route-stage selection focuses the stage detail region after the latest render. Planner validation alerts are focusable and receive focus. The source dialog restores focus to its trigger on close, closes on Escape, and traps Tab focus while open. Navigation buttons expose `aria-current="page"` on the visible current tree, and the application now contains one semantic `h1`.

Settings use a semantic `fieldset` and `legend`. The planner no longer offers time planning, fastest routing, step-free preference, or accessible routing as if those capabilities were available. It offers static topology and fewest confirmed changes, while accessible routing is presented as pending station data. Named terminal directions are used in ride stages, and a start stage is always present.

Dark mode and high contrast now have explicit dark/high-contrast tokens, including light-on-dark control boundaries and a high-contrast action state. Telugu labels and reduced motion are covered by browser tests. The 200% text check reports no horizontal overflow at all required widths.

## Reviewed screenshots

The evidence set contains planner, route result, station detail, source dialog, validation error, dark journey, high contrast, Telugu, reduced motion, and 200% text captures at 390×844, 768×1024, and 1440×900. The contact sheets were visually inspected. The route-result images show the promised start stage, named terminal direction, and pending-transfer disclosure. The dialog and error images show the corrected focusable boundaries and alert treatment.

## Known boundaries

The build continues to provide verified-static topology only. Timing, current arrivals, fare, platform, exit, parking, facility, accessibility equipment, and live-service claims remain unavailable. A station detail view remains a structural fixture marked `DEMO / NOT VERIFIED`. Transfer paths are pending verification unless the relevant edge metadata changes from that state through a provenance-backed update. The service worker caches only the static shell and never simulates live transit freshness.
