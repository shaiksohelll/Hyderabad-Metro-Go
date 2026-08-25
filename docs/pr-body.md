## Summary

This draft PR contains the final focused correction pass for the approved Hyderabad Metro Go rebuild on `manus-1.6/hyderabad-metro-go-rebuild`. It keeps PR #3 draft-only and does not modify or merge `main`.

The correction pass adds exact viewport assertions and evidence at 390×844, 768×1024, and 1440×900; documented Chromium effective-CSS-viewport 200%-equivalent reflow checks; route, dialog, error, control, and mobile-menu operability checks under zoom; route-model-derived map bounds, padded terminus, actual rendered SVG label-collision, interchange, and line-pattern assertions; exhaustive all-station-pair routing; navigation-only service-worker HTML fallback; explicit offline script/style/JSON failure tests, including real Chromium origin-offline navigation and asset checks; partial topology provenance with owner and refresh metadata; the **Fewest modeled line changes** objective label; Direction A multilingual humanist-sans typography; an explicit partial Telugu-support boundary; improved amber contrast; and correct mobile-menu `aria-expanded` reset on Escape.

## Data and routing boundary

The app uses stable station identities and an official L&T source record for the static station selector. The topology record is intentionally marked **partial** with medium confidence because station names are supported by the official selector while line membership, ordering, and physical transfer metadata still require field-level review. Provenance carries source URL, verification date, owner, refresh policy, confidence, status, and notes.

`Osmania Medical College` is present on the Red Line. `Parade Ground` and `JBS Parade Ground` remain distinct identities. No direct Parade Ground-to-JBS Parade Ground edge is inserted without provenance; the test asserts that exact edge is absent. Ameerpet and MG Bus Station edges carry `pending-verification` transfer metadata, and the route result surfaces that status.

The planner exposes **Best modeled topology** and **Fewest modeled line changes**. Timing, fare, platform, exit, parking, facility, accessibility-equipment, arrival, and service-status values remain unavailable. Accessible routing is not offered as a selectable capability and is explicitly withheld pending station data. Ride stages use named terminal directions and every route includes a start stage.

## Hosting, service worker, and map corrections

All shell, manifest, router, service-worker cache, service-worker registration, and fallback URLs use `/Hyderabad-Metro-Go/`. `404.html` serves the app shell for refreshable internal routes. The service worker precaches an explicit shell, falls back to cached HTML only for navigation requests, does not dynamically cache arbitrary GET responses, and never returns HTML for failed JavaScript, CSS, JSON, or other assets. Tests cover those offline boundaries.

The schematic map reads the same line-order model used by routing. All stations and termini stay inside padded viewbox bounds; labels are collision-checked; Ameerpet and MG Bus Station align as shared anchors; and Parade Ground and JBS Parade Ground do not overlap. A visible legend and solid/dash/dot stroke patterns distinguish Red, Blue, and Green independently of color.

## State, accessibility, and language corrections

The render queue stores and renders the newest state after frame batching. The correction also retains focusable planner errors, route-stage detail focus, Escape-to-close and Tab trapping for the source dialog, focus restoration to the dialog trigger, one semantic `h1`, visible `aria-current`, semantic settings `fieldset`/`legend`, dark/high-contrast tokens, and reduced-motion behavior. Mobile-menu Escape now hides the menu and resets `aria-expanded` to `false`.

Direction A now uses a multilingual humanist-sans stack based on Noto Sans with Telugu fallback. Telugu support is explicitly partial: navigation, station names, and core planner labels are translated; some explanatory, status, and source-boundary text remains in English.

## Tests and evidence

`npm run verify` runs syntax, route/map, static-host, service-worker offline, browser smoke, responsive, semantic, locale, dark-mode, high-contrast, reduced-motion, exact viewport, page-scale zoom, and 200% reflow checks. Pull-request CI provisions Chromium and runs the same verification command on `pull_request` events. Verification and deployment have separate concurrency groups; Pages write and identity-token permissions are scoped only to the gated deployment job, while deployment remains restricted to pushes on `main`.

The reviewed evidence package contains 30 exact-dimension PNG captures for planner, route result, station detail, source dialog, validation error, dark journey, high contrast, Telugu, reduced motion, and real 200% browser zoom at all three required viewports, plus revised contact sheets and an exact-dimension inventory. Stale failed CI logs are excluded.

## Merge constraint

This PR remains draft-only. Do not merge it into `main` until independent review, production data verification, accessibility review, deployment validation, and owner approval are complete.
