# Hyderabad Metro Go — Corrected QA Report

## Scope

This report covers the final focused correction pass for draft PR #3 on `manus-1.6/hyderabad-metro-go-rebuild`. The branch remains draft-only and `main` is not modified. The pass addresses exact viewport evidence, effective-CSS-viewport reflow, map geometry, service-worker failure boundaries, topology provenance, multilingual labeling, contrast, mobile-menu semantics, repository documentation, GitHub Actions permissions/concurrency, and stale evidence cleanup.

## Verification matrix

| Check | Result | Evidence |
|---|---|---|
| JavaScript syntax | PASS | `npm run check` |
| Route-engine and exact-edge tests | PASS | `npm run test:route` |
| Exhaustive all-station-pair routing | PASS | `npm run test:exhaustive` — 3,192 ordered pairs |
| Map bounds, padded termini, actual SVG label collisions, and line patterns | PASS | `npm run test:route` and `npm run test:browser-qa` |
| Project-subpath/static-host fallback | PASS | `npm run test:static-host` |
| Service-worker offline navigation and asset failures | PASS | `npm run test:service-worker` and `npm run test:service-worker-browser` |
| Browser smoke, including mobile-menu Escape semantics | PASS | `npm run test:browser` |
| Exact viewport, actual SVG, locale, and effective-CSS-viewport reflow QA | PASS | `npm run test:browser-qa` |
| Pull-request CI | PASS | Final green verify check linked in the delivery message and PR checks |
| Whitespace/error check | PASS | `git diff --check` |
| Visual state review | PASS | 30 exact-dimension PNGs and three revised contact sheets, reviewed after the final capture |
| Stale failed CI-log cleanup | PASS | Evidence archive contains only current screenshots, contact sheets, and inventory metadata |

## Exact viewport and zoom correction

The browser QA harness launches Chromium with explicit width and height, applies matching device metrics, and asserts `window.innerWidth` and `window.innerHeight` before evaluating each viewport. The required dimensions are 390×844, 768×1024, and 1440×900.

The prior root-font-size and pinch/page-magnification checks have been removed. The replacement uses Chromium device metrics with a 2× device scale factor and half-width/half-height effective CSS viewport to exercise the 200%-equivalent responsive reflow. It asserts the changed `innerWidth`/`innerHeight`, device pixel ratio, breakpoint behavior, no horizontal document overflow, complete visible control boxes, route-stage readability and operation, dialog fit and Escape operation, and readable, focused planner errors. This is a documented layout-equivalent effective-CSS-viewport method, not a claim of native browser zoom.

## Map geometry and line identity

The schematic map is generated from the shared `lineOrders` route model. All station points and termini are asserted within padded viewbox bounds. Browser QA measures the actual rendered SVG `getBBox()` values for station circles and English/Telugu station and legend labels, then checks padded-bound containment, visibility, and pairwise collision. Ameerpet and MG Bus Station remain aligned shared anchors, while Parade Ground and JBS Parade Ground remain distinct non-overlapping nodes.

The map viewbox now includes a visible legend with line codes and names. Red uses a solid stroke, Blue uses a dash pattern, and Green uses a dot pattern so line identity does not depend on color alone. The text alternative repeats the codes and names.

## Service-worker failure boundaries

The service worker precaches the explicit static shell only. For same-origin navigation requests under `/Hyderabad-Metro-Go/`, an offline failure returns the cached `index.html` shell. Non-navigation JavaScript, CSS, JSON, and other asset requests are cache-first only when already precached and otherwise retain their network failure; they are never replaced with HTML and are never dynamically cached. The service-worker test exercises offline navigation, failed script/style/JSON requests, successful non-navigation requests, and out-of-scope requests.

## Topology provenance and multilingual boundary

The station selector and line-order record are now explicitly marked `partial` with medium confidence because the official L&T trip selector supports the station names but line membership, ordering, and physical transfer metadata still require field-level review. Provenance records include source URL, verification date, owner, refresh policy, confidence, status, and notes. The planner label is **Fewest modeled line changes**, not “confirmed changes.”

Direction A uses a multilingual humanist-sans stack based on Noto Sans with Telugu fallback. Telugu support is explicitly labeled partial: navigation, station names, and core planner labels are translated, while some explanatory, status, and source-boundary text remains English. No unsupported operational, fare, timing, facility, accessibility, or live-service claim has been added.

## Accessibility and contrast correction

Amber warning text now uses a darker light-mode ink and explicit warning backgrounds, with dedicated dark and high-contrast tokens. The mobile-menu Escape handler hides the menu and resets `aria-expanded` to `false`; the browser smoke suite asserts both conditions. Existing focus, dialog trapping/restoration, semantic heading, visible `aria-current`, route-stage, and planner-error checks remain active.

## Evidence

The evidence set contains planner, route result, station detail, source dialog, validation error, dark journey, high contrast, Telugu, reduced motion, and effective-CSS-viewport 200%-equivalent reflow captures at 390×844, 768×1024, and 1440×900. Every PNG is dimension-checked by the inventory generator, and every capture asserts the viewport dimensions before taking the screenshot. Three revised contact sheets are included for visual review. The archive contains no stale failed CI logs.

## Repository and workflow correction

README local-run instructions now distinguish local-root serving from the GitHub Pages `/Hyderabad-Metro-Go/` project path and document the verification commands. GitHub Actions verification and deployment use separate concurrency groups. Pages write and identity-token permissions exist only on the gated deployment job; the verification job receives read-only repository contents permission. Deployment remains restricted to pushes on `main` after verification.

## Known boundaries

The build continues to provide a partial modeled static topology, not production-grade live passenger operations. Timing, current arrivals, fare, platform, exit, parking, facility, accessibility equipment, and live-service claims remain unavailable. Station detail remains a structural fixture marked `DEMO / NOT VERIFIED`. Transfer paths remain pending verification unless the relevant edge metadata changes through a provenance-backed update. The service worker caches only the explicit static shell and never simulates live transit freshness.
