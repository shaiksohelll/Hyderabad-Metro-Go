# Hyderabad Metro Go 2.0

A clean-slate, map-led Hyderabad Metro journey planner built with semantic HTML, modern CSS, and modular vanilla JavaScript.

> **Preview status:** Network routing is functional. Timings, station facilities, service status, and fares must be verified against official Hyderabad Metro sources before being presented as travel facts.

## What changed

This is not a reskin of the original three-panel DOM project. The interface, responsive layout, design system, data model, route engine, state handling, and interaction architecture have been rebuilt.

## Features

- Interactive schematic map for Red, Blue, and Green lines
- Multi-line routing with explicit interchange modeling
- Separate Parade Ground and JBS Parade Ground station identities
- Fastest and fewer-change route preferences
- Stop-by-stop journey details
- Recent journeys stored locally
- English and Telugu interface modes
- Light and dark themes
- Reduced-motion control and system preference support
- Keyboard-operable stations and native dialog behavior
- Offline app shell through a service worker
- GSAP-enhanced motion with Web Animations fallback

## Run locally

```bash
python3 -m http.server 3000
```

Open <http://localhost:3000>.

## Test

```bash
npm test
npm run check
```

The tests use Node's built-in test runner and require no package installation.

## Data policy

The network currently uses the operational Red, Blue, and Green line station order as preview data. Fares, timings, facilities, parking, accessibility equipment, platform guidance, and real-time status must be sourced and timestamped before release.

Official reference: <https://ltmetro.com/>
