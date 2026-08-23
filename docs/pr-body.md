## Summary

This draft PR corrects the approved Hyderabad Metro Go rebuild on `manus-1.6/hyderabad-metro-go-rebuild`. It keeps PR #3 draft-only and does not modify or merge `main`.

The correction pass makes the static app work under `/Hyderabad-Metro-Go/`, adds GitHub Pages deep-link fallback, restores Osmania Medical College from the official L&T trip selector, replaces the broad Parade Ground assertion with exact graph-edge assertions, derives map geometry from the same line-order model as routing, fixes latest-state rendering, and hardens focus, dialog, heading, settings, `aria-current`, dark/high-contrast, and text-scale behavior.

## Data and routing boundary

The app uses stable station identities and an official L&T source record for the static station selector. `Osmania Medical College` is present on the Red Line. `Parade Ground` and `JBS Parade Ground` remain distinct identities. No direct Parade Ground-to-JBS Parade Ground edge is inserted without provenance; the test asserts that exact edge is absent. Ameerpet and MG Bus Station edges carry `pending-verification` transfer metadata, and the route result surfaces that status.

The planner exposes only **Best static topology** and **Fewest confirmed changes**. Timing, fare, platform, exit, parking, facility, accessibility-equipment, arrival, and service-status values remain unavailable. Accessible routing is not offered as a selectable capability and is explicitly withheld pending station data. Ride stages use named terminal directions and every route includes a start stage.

## Hosting and state corrections

All shell, manifest, router, service-worker cache, service-worker registration, and fallback URLs use `/Hyderabad-Metro-Go/`. `404.html` serves the app shell for refreshable internal routes. The static-host test verifies project-subpath assets and deep-link fallback. The render queue stores and renders the newest state after frame batching, preventing stale DOM output.

The correction also adds focusable planner errors, route-stage detail focus, Escape-to-close and Tab trapping for the source dialog, focus restoration to the dialog trigger, one semantic `h1`, visible `aria-current` state, semantic settings `fieldset`/`legend`, dark/high-contrast token corrections, Telugu labels, reduced motion, and no horizontal overflow at 200% text.

## Tests and evidence

The repository now contains route/map assertions, static-host/project-subpath tests, browser smoke tests, and responsive/accessibility browser QA. `npm run verify` runs syntax, route, static-host, browser, responsive, semantic, locale, dark-mode, high-contrast, reduced-motion, and 200% text checks. Pull-request CI provisions Chromium and runs the same verification command on `pull_request` events; deployment remains restricted to main pushes.

The reviewed evidence package contains planner, route result, station detail, source dialog, validation error, dark journey, high contrast, Telugu, reduced motion, and 200% text captures at 390×844, 768×1024, and 1440×900, plus contact sheets and the corrected QA report.

## Merge constraint

This PR remains draft-only. Do not merge it into `main` until independent review, production data verification, accessibility review, deployment validation, and owner approval are complete.
