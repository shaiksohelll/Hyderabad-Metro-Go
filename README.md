# Hyderabad Metro Go

Hyderabad Metro Go is a passenger-first, static GitHub Pages journey planner for Hyderabad Metro. The rebuild is implemented as a modular browser application with stable station identities, an explicit route service, accessible route-stage rendering, a schematic map companion, versioned local persistence, and an offline app shell.

## Current implementation boundary

This branch contains the approved high-fidelity vertical slice for the **Signage Ledger** visual direction. The route engine currently provides verified-static topology only. Scheduled duration, fare, platform, exit, facility, parking, accessibility-equipment, arrival, and live-service claims remain unavailable unless individually sourced and verified. Station detail is visibly marked `DEMO / NOT VERIFIED`.

The route result uses a semantic numbered stage strip for start, ride, change, and arrive steps. Direction C behavior is reserved for Live Journey and dark/high-contrast modes. No 3D, gradients, glows, decorative blur, fake analytics, or marketing-led hero screen is included.

## Run locally

Open `index.html` through a static server so module scripts and the service worker work correctly. For example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.

## Architecture

The frontend is intentionally framework-free and split by responsibility:

| Module | Responsibility |
|---|---|
| `src/data.js` | Stable stations, lines, localized names, provenance, and demo boundaries |
| `src/route-engine.js` | Explicit ride/transfer graph, deterministic passenger-aware search, route stages |
| `src/store.js` | Reducer-based state transitions and view state |
| `src/view.js` | Semantic rendering of planner, results, map, station detail, saved, settings, and journey |
| `src/map-view.js` | Schematic SVG map and textual network alternative |
| `src/a11y.js` | Focus, announcements, preference application, and locale state |
| `src/persistence.js` | Versioned localStorage for saved routes with safe failure |
| `src/app.js` | Application orchestration, delegated events, navigation, planning, persistence, service-worker registration |
| `src/styles.css` | Direction A tokens, responsive layouts, dark mode, high contrast, reduced motion |

## Testable behaviors in the vertical slice

The slice includes mobile planner and route result, a vertical route-stage strip, desktop planner and route ledger, map companion, station detail, Live Journey dark mode, source/unavailable/stale/error boundaries, English/Telugu labels, keyboard focus styles, and reduced-motion behavior. The application intentionally lets the user plan manually when location is unavailable.

## Source policy

The official source candidates for topology and station context are linked in the Phase 1 and Phase 3 research documents. Every production factual record must carry a source URL, verification date, confidence, status, owner, refresh policy, and notes. Do not replace unavailable data with synthetic fare/time/distance values.

## Branch policy

This work is on `manus-1.6/hyderabad-metro-go-rebuild`. The branch must not be merged into `main` without explicit owner authorization after QA and review. Closed PR #1 and `rebuild/hmg-2026` are not used.
