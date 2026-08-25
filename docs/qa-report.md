# Hyderabad Metro Go — Corrected QA Report

## Scope

This report covers the official-data integration pass for draft PR #3 on `manus-1.6/hyderabad-metro-go-rebuild`. The branch remains draft-only and `main` is not modified. The pass integrates the official L&T Metro Rail network map topology (station identity, line membership, order, station numbering, three interchange relationships) and official fare zones (₹11–₹69, effective 24 May 2025). It adds the Parade Ground \u2194 JBS Parade Ground confirmed transfer, schematic transfer connector, fare-zone data model and UI, and comprehensive test coverage.

## Verification matrix

| Check | Result | Evidence |
|---|---|---|
| JavaScript syntax | PASS | `npm run check` |
| Route-engine, interchange, and station-numbering tests | PASS | `npm run test:route` — 48 assertions |
| Fare-zone boundary and source metadata tests | PASS | `npm run test:fare` — 30 assertions |
| Exhaustive all-station-pair routing | PASS | `npm run test:exhaustive` — 3,192 ordered pairs, 0 unreachable |
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

The schematic map is generated from the shared `lineOrders` route model. All station points and termini are asserted within padded viewbox bounds. Browser QA measures the actual rendered SVG `getBBox()` values separately for station labels (`.map-label`) and legend labels (`.map-legend-label`). English assertions verify station-label count is greater than zero, and that station labels are visible, padded, and collision-safe. Telugu assertions verify station-label count is exactly zero by design, that the three legend labels remain visible and geometrically valid, that the textual alternative changes immediately, and that every one of the 57 unique modeled stations has its Telugu display name represented in the textual alternative. Ameerpet and MG Bus Station remain aligned shared anchors. Parade Ground (Blue) and JBS Parade Ground (Green) are distinct non-overlapping nodes linked by an explicit transfer connector (dashed line). The map textual alternative now describes all three interchange relationships.

The map viewbox now includes a visible legend with line codes and names. Red uses a solid stroke, Blue uses a dash pattern, and Green uses a dot pattern so line identity does not depend on color alone. English uses a sparse terminal/interchange label set. Telugu station labels are intentionally withheld in the SVG until a complete Telugu font/label review is available; the legend, line patterns, and complete localized textual alternative remain available.

## Service-worker failure boundaries

The service worker precaches the explicit static shell only. For same-origin navigation requests under `/Hyderabad-Metro-Go/`, an offline failure returns the cached `index.html` shell. Non-navigation JavaScript, CSS, JSON, and other asset requests are cache-first only when already precached and otherwise retain their network failure; they are never replaced with HTML and are never dynamically cached. The service-worker test exercises offline navigation, failed script/style/JSON requests, successful non-navigation requests, and out-of-scope requests.

The station model and line-order records are now sourced from the official L&T Metro Rail (Hyderabad) network map with high confidence for station identity, line membership, order, station numbering, termini, and interchange topology. All three interchange relationships are confirmed: Ameerpet (Red/Blue), MG Bus Station (Red/Green), and Parade Ground (Blue) ↔ JBS Parade Ground (Green). Provenance records carry source URL, source type, verification date, owner, refresh policy, confidence, status, and notes. The planner label is **Fewest modeled line changes**, not "confirmed changes."

Official fare zones (₹11–₹69, effective 24 May 2025) are sourced from L&TMRHL/CCD/PR/189/23-05-2025. The fare-zone model is exposed in the Source & limits dialog with the official zone table and effective date. Exact route fare remains unavailable because verified station-to-station distance data is not yet sourced.

Direction A uses a multilingual humanist-sans stack based on Noto Sans with Telugu fallback. Telugu support is explicitly labeled partial: navigation, station names, and core planner labels are translated, while some explanatory, status, and source-boundary text remains English. No unsupported operational, timing, facility, accessibility, or live-service claim has been added.

## Accessibility and contrast correction

Amber warning text now uses a darker light-mode ink and explicit warning backgrounds, with dedicated dark and high-contrast tokens. The mobile-menu Escape handler hides the menu and resets `aria-expanded` to `false`; the browser smoke suite asserts both conditions. Existing focus, dialog trapping/restoration, semantic heading, visible `aria-current`, route-stage, and planner-error checks remain active.

## Evidence

The evidence set contains planner, route result, station detail, source dialog, validation error, dark journey, high contrast, Telugu, reduced motion, and effective-CSS-viewport 200%-equivalent reflow simulation (not native browser zoom) captures at 390×844, 768×1024, and 1440×900. Every PNG is dimension-checked by the inventory generator, and every capture asserts the viewport dimensions before taking the screenshot. Three revised contact sheets are included for visual review. The archive contains no stale failed CI logs.

## Repository and workflow correction

README local-run instructions now distinguish local-root serving from the GitHub Pages `/Hyderabad-Metro-Go/` project path and document the verification commands. GitHub Actions verification and deployment use separate concurrency groups. Pages write and identity-token permissions exist only on the gated deployment job; the verification job receives read-only repository contents permission. Deployment remains restricted to pushes on `main` after verification.

## Known boundaries

The build provides official static topology sourced from the L&T Metro Rail network map, not production-grade live passenger operations. Timing, current arrivals, exact route fare, platform, exit, parking, facility, accessibility equipment, and live-service claims remain unavailable. Station detail remains a structural fixture marked `DEMO / NOT VERIFIED`. Transfer walking paths and durations are unavailable. Official fare zones are displayed but exact journey fare cannot be calculated without verified station-to-station distance data. The service worker caches only the explicit static shell and never simulates live transit freshness.
