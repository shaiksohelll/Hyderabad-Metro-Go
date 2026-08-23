# Vertical Slice Milestone — Hyderabad Metro Go 1.6

The approved high-fidelity vertical slice uses **Direction A — Signage Ledger** as the controlling system. Direction B contributes only the semantic numbered route-stage strip, and Direction C contributes only dark/high-contrast and Live Journey behavior.

## Included

The slice includes a mobile-first planner, route result with explicit start/ride/change/arrive stages, desktop route ledger, schematic map companion, textual map alternative, Ameerpet station detail fixture, Live Journey static companion, loading state, unavailable/stale/error states, English/Telugu labels, keyboard-visible focus, reduced-motion CSS, high-contrast preference, versioned local persistence, and an offline shell.

## Rendered viewports

| Viewport | Result |
|---|---|
| 390 × 844 | Planner-first mobile composition; stacked fields; vertical content flow |
| 768 × 1024 | Tablet composition; balanced planner fields; sequential route/map sections |
| 1440 × 900 | Quiet desktop rail; primary route-reading area; optional map/context column |

## Interaction evidence

The private smoke test verified direct route success, explicit post-transfer ride stages, non-zero transfer edges, unavailable timing and fare states, same-station validation, distinct Parade Ground/JBS Parade Ground identities, accessibility data withheld, Live Journey static mode, Ameerpet fixture boundary, source dialog, Telugu locale, dark mode, and same-station error announcement.

## Data honesty boundary

This milestone ships a static topology snapshot only. It does not claim current arrivals, live positions, schedule durations, fare values, platform assignments, exits, parking availability, facilities, accessibility equipment, or service status. Station detail remains visibly `DEMO / NOT VERIFIED`. Any production data added later must include source URL, last-verified date, confidence, status, owner, refresh policy, and assumptions for derived values.

## Visual gate result

The slice does not use a marketing hero, dashboard widget grid, bento layout, glassmorphism, decorative gradient, glow, fake analytics, meaningless 3D, or continuous motion. Motion is disabled or reduced under the reduced-motion preference and never implies live transit freshness.
