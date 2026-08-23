# Hyderabad Metro Go — QA Report

## Scope

This report covers the approved Direction A vertical slice on branch `manus-1.6/hyderabad-metro-go-rebuild`. It includes the shared Direction B route-stage strip and Direction C dark/Live Journey behavior. It does not claim production transit-data correctness for facts that remain unavailable.

## Verification summary

| Check | Result | Evidence |
|---|---|---|
| JavaScript syntax | PASS | `npm run check` |
| Route-engine behavior | PASS | `npm run test:route` |
| Whitespace/error diff check | PASS | `git diff --check` |
| Legacy CDN/architecture references | PASS | Static grep check |
| Static semantic structure | PASS | Private static QA script |
| Browser interaction smoke | PASS | Route, Live Journey, station detail, source dialog, locale, dark mode, same-station validation |
| Responsive overflow | PASS | CDP QA at 390×844, 768×1024, 1440×900 |
| Interactive naming/labels | PASS | Browser QA: all buttons named, selects labelled |
| Navigation landmarks/skip link | PASS | Browser QA: `main`, `nav`, skip link present |
| Reduced motion preference | PASS | Browser QA: `data-motion="reduced"` applied |
| Rendered visual inspection | PASS | Screenshots inspected at all three required viewports |

## Route-engine cases

The route smoke suite verifies direct success, explicit transfer success, explicit post-transfer ride leg, non-zero transfer edges, unavailable timing and fare, same-station validation, distinct Parade Ground/JBS Parade Ground identities, explicit connection between those identities, and accessible-route uncertainty. The engine is deterministic and uses stable IDs; it does not use station display labels as graph keys.

## Responsive and accessibility checks

The browser QA reported no horizontal overflow at all required sizes. All visible buttons had a text or ARIA name, all selects were contained in labels, the page exposed `main` and `nav` landmarks, and the skip link was present. The reduced-motion preference changed the document state and the CSS removes non-essential transition/animation behavior. The UI includes live announcement regions, alert semantics for planner errors, visible focus styles, semantic headings, text route alternatives, and line names/codes alongside color.

The 390×844 render uses a compact mobile header, stacked planner fields, vertical route reading, and no fixed viewport shell. The 768×1024 render uses a compact header and sequential readable sections. The 1440×900 render uses the quiet navigation rail, primary route-reading column, and optional map/context column required by the approved visual direction.

## Performance observations

The static local shell measured approximately 92 KB for the `src/` directory, with the largest files being `view.js` at 18.3 KB, `styles.css` at 16.3 KB, and `route-engine.js` at 8.9 KB. The HTML shell is 801 bytes and uses no third-party CDN scripts, styles, font requests, map library, image payload, or 3D runtime. Local loopback response times were under 1 ms for the sampled shell, modules, and stylesheet; this is a local sanity check, not a production Web Vitals measurement.

## Known limitations and follow-up gates

The route engine currently provides verified-static topology only. Timing, fare, platform, exit, facility, parking, accessibility equipment, service status, and live arrivals remain unavailable. The Ameerpet station page is explicitly `DEMO / NOT VERIFIED`. The visual map is schematic and not a replacement for a source-backed official network map. Production data ingestion, source review, accessible transfer metadata, full line/edge test coverage, and a real GitHub Pages deployment check remain follow-up work.

The service worker caches the static app shell and returns the app shell on failed GET requests. It does not cache or simulate live transit feeds. No merge to `main` was performed.
