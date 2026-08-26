## Summary

This draft PR contains the official-data integration pass for the approved Hyderabad Metro Go rebuild on `manus-1.6/hyderabad-metro-go-rebuild`. It keeps PR #3 draft-only and does not modify or merge `main`.

The integration pass sources the network topology from the official L&T Metro Rail (Hyderabad) network map with high confidence for station identity, line membership, order, station numbering, termini, and all three interchange relationships. Official fare zones (₹11–₹69, effective 24 May 2025) are sourced from L&TMRHL/CCD/PR/189/23-05-2025. The Parade Ground (Blue) ↔ JBS Parade Ground (Green) transfer is now an active confirmed interchange with two distinct station identities linked by a bidirectional transfer edge. The schematic map includes an explicit transfer connector. Exact route fare remains unavailable because verified station-to-station distance data is not yet sourced.

## Data and routing boundary

The app uses stable station identities sourced from the official L&T Metro Rail network map. The topology record carries high confidence for station identity, line membership, order, station numbering, termini, and interchange topology. Provenance carries source URL, source type, verification date, owner, refresh policy, confidence, status, and notes. The topology is not authoritative for live service, timing, accessibility condition, or transfer duration.

Red Line: 27 stations, Miyapur (#1) to L B Nagar (#27). Blue Line: 23 stations, Nagole (#1) to Raidurg (#23). Green Line: 9 stations, JBS Parade Ground (#1) to MG Bus Station (#9). Total: 57 unique station identities, 59 line memberships.

Interchanges: Ameerpet (Red ↔ Blue), MG Bus Station (Red ↔ Green), Parade Ground (Blue) ↔ JBS Parade Ground (Green). Parade Ground and JBS Parade Ground remain distinct station IDs forming a connected interchange complex. The route stage for cross-station transfers names both stations: "Transfer between Parade Ground and JBS Parade Ground." with disclosure: "Walking path and transfer duration are unavailable."

The planner exposes **Best modeled topology** and **Fewest modeled line changes**. Official fare zones are displayed (₹11–₹69, effective 24 May 2025) but exact route fare is unavailable because verified station-to-station distance data has not been sourced. Timing, platform, exit, parking, facility, accessibility-equipment, arrival, and service-status values remain unavailable. Accessible routing is not offered as a selectable capability and is explicitly withheld pending station data.

## Hosting, service worker, and map corrections

All shell, manifest, router, service-worker cache, service-worker registration, and fallback URLs use `/Hyderabad-Metro-Go/`. `404.html` serves the app shell for refreshable internal routes. The service worker precaches an explicit shell, falls back to cached HTML only for navigation requests, does not dynamically cache arbitrary GET responses, and never returns HTML for failed JavaScript, CSS, JSON, or other assets. Tests cover those offline boundaries.

The schematic map reads the same line-order model used by routing. All stations and termini stay inside padded viewbox bounds; labels are collision-checked; Ameerpet and MG Bus Station align as shared anchors; Parade Ground and JBS Parade Ground are distinct nearby nodes linked by an explicit dashed transfer connector. A visible legend and solid/dash/dot stroke patterns distinguish Red, Blue, and Green independently of color. The map textual alternative describes all three interchange relationships.

## State, accessibility, and language corrections

The render queue stores and renders the newest state after frame batching. The correction also retains focusable planner errors, route-stage detail focus, Escape-to-close and Tab trapping for the source dialog, focus restoration to the dialog trigger, one semantic `h1`, visible `aria-current`, semantic settings `fieldset`/`legend`, dark/high-contrast tokens, and reduced-motion behavior. Mobile-menu Escape now hides the menu and resets `aria-expanded` to `false`.

Direction A now uses a multilingual humanist-sans stack based on Noto Sans with Telugu fallback. Telugu support is explicitly partial: navigation, station names, and core planner labels are translated; some explanatory, status, and source-boundary text remains in English.

## Official fare zones

The Source & limits dialog now displays the official fare-zone table with 10 zones (₹11 to ₹69), effective date, applicable fare media, and a link to the official source document. The fare-zone lookup function accepts a verified distance in kilometres and returns the corresponding fare. Route results display "Exact fare unavailable" because verified station-to-station distance data is not yet sourced. The planner help text notes: "Official fare zones: ₹11–₹69."

## Tests and evidence

`npm run verify` runs syntax, route/map (48 assertions including official station counts, station numbering, three interchange relationships, Parade Ground/JBS cross-station transfer, and map transfer connector), fare-policy (30 assertions covering all zone boundaries and invalid inputs), exhaustive all-station-pair routing (3,192 ordered pairs), static-host, service-worker offline, browser smoke, responsive, semantic, locale, dark-mode, high-contrast, reduced-motion, exact viewport, and effective-CSS-viewport 200%-equivalent reflow simulation checks. This is not native browser zoom. Pull-request CI provisions Chromium and runs the same verification command on `pull_request` events.

## Merge constraint

This PR remains draft-only. Do not merge it into `main` until independent review, production data verification, accessibility review, deployment validation, and owner approval are complete.
