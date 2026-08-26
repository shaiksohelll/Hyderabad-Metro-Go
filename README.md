# Hyderabad Metro Go

Hyderabad Metro Go is a passenger-first, static GitHub Pages journey planner for Hyderabad Metro. The rebuild is implemented as a modular browser application with stable station identities, an explicit route service, accessible route-stage rendering, a schematic map companion, versioned local persistence, and an offline app shell.

## Current implementation boundary

This branch contains the approved high-fidelity vertical slice for the **Signage Ledger** visual direction. Network topology and all three interchange relationships (Ameerpet Red/Blue, MG Bus Station Red/Green, and Parade Ground Blue / JBS Parade Ground Green) are sourced from the official L&T Metro Rail static network map with high confidence. Official fare zones (₹11–₹69, effective 24 May 2025) are sourced from the official L&TMRHL fare revision press release. Exact route fare remains unavailable because verified station-to-station distance data is not yet sourced. Scheduled duration, platform, exit, facility, parking, accessibility-equipment, arrival, and live-service claims remain unavailable unless individually sourced and verified. Station detail is visibly marked `DEMO / NOT VERIFIED`.

The route result uses a semantic numbered stage strip for start, ride, change, and arrive steps. Direction C behavior is reserved for Live Journey and dark/high-contrast modes. No 3D, gradients, glows, decorative blur, fake analytics, or marketing-led hero screen is included.

## Run locally

Serve the repository parent with a static server so the project directory is available at the same `/Hyderabad-Metro-Go/` path used by GitHub Pages. From the repository root:

```bash
python3 -m http.server 4173 --directory .. --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/Hyderabad-Metro-Go/`. The `/Hyderabad-Metro-Go/` prefix is the GitHub Pages project path; the committed static-host and browser tests follow this URL and exercise the `404.html` deep-link fallback:

```bash
npm run verify
```

The browser checks use a locally installed Chromium. To run them explicitly:

```bash
CHROMIUM=$(command -v chromium) npm run verify
```

## Architecture

The frontend is intentionally framework-free and split by responsibility:

| Module | Responsibility |
|---|---|
| `src/data.js` | Official station identities, line membership, station numbering, interchanges, fare zones, provenance, and source records |
| `src/route-engine.js` | Explicit ride/transfer graph, deterministic passenger-aware search, route stages |
| `src/store.js` | Reducer-based state transitions and view state |
| `src/view.js` | Semantic rendering of planner, results, map, station detail, saved, settings, and journey |
| `src/map-view.js` | Schematic SVG map and textual network alternative |
| `src/a11y.js` | Focus, announcements, preference application, and locale state |
| `src/persistence.js` | Versioned localStorage for saved routes with safe failure |
| `src/app.js` | Application orchestration, delegated events, navigation, planning, persistence, service-worker registration |
| `src/styles.css` | Direction A multilingual humanist-sans tokens, responsive layouts, dark mode, high contrast, reduced motion |

## Testable behaviors in the vertical slice

The slice includes mobile planner and route result, a vertical route-stage strip, desktop planner and route ledger, map companion, station detail, Live Journey dark mode, source/unavailable/stale/error boundaries, English/Telugu labels, keyboard focus styles, and reduced-motion behavior. The application intentionally lets the user plan manually when location is unavailable.

## Source policy

Network topology is sourced from the official L&T Metro Rail (Hyderabad) network map. Official fare zones are sourced from L&TMRHL/CCD/PR/189/23-05-2025, effective 24 May 2025. Operational information remains unavailable. Every production factual record carries a source URL, verification date, confidence, status, owner, refresh policy, and notes. Do not replace unavailable data with synthetic fare/time/distance values.

## Branch policy

This work is on `manus-1.6/hyderabad-metro-go-rebuild`. The branch must not be merged into `main` without explicit owner authorization after QA and review. Closed PR #1 and `rebuild/hmg-2026` are not used.
