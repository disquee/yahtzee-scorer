# DISQO'S YACHT PARTY

A stark, high-contrast, Progressive Web App (PWA) implementation of the classic Yacht dice game. 

Built with a strict Brutalist, Docs-as-Code aesthetic, this project strips away gradients, drop-shadows, and superfluous animations in favor of heavy borders, monospace typography, and absolute functional clarity. 

## 🏗️ Design Philosophy

Ambiguity and chance are just parts of life. They aren't enemies to be defeated; they are inherently something to be experienced. 

This interface is the structure built around that chaos. The design relies on primal visual language—heavy grids, pure high-contrast colors, and terminal-style typography—to create a system that is robust, unapologetic, and highly legible across any device.

## ✨ Core Features

* **The Optimizer:** A mathematically driven suggestion engine. Toggle `OPT: ON` and the system calculates the optimal scoring move for your current roll, highlighting it with a ✏️ and a high-contrast `#beddff` background. It suggests; you decide.
* **Score Card Only Mode:** Strips away the digital dice entirely for physical tabletop play, collapsing the UI into a massive, multi-player digital scorecard.
* **Fully Responsive Grid:** Flexbox architecture that dynamically scales down to maintain absolute containment on the narrowest of mobile screens without breaking the borders.
* **Defensive UX:** Destructive actions (like the global reset) require a double-opt-in visual state-change to prevent accidental taps.

## ⚙️ Architecture & PWA

*Disqo's Yacht Party* is a fully installable, offline-capable Progressive Web App. It requires no database, no external libraries, and no build step.

* **Vanilla Stack:** Pure HTML, CSS, and JavaScript. 
* **`manifest.json`:** Defines the system UI, colors, and the 192px/512px standalone home screen icons.
* **`sw.js` (Service Worker):** Intercepts network requests and caches the core assets, allowing the game to be played perfectly offline after the initial load.

## 🚀 Deployment

Designed to be hosted entirely statically via GitHub Pages. 

1. Clone the repository.
2. Push to the `main` branch.
3. Enable GitHub Pages from the repository settings.
4. Navigate to the live URL on an iOS or Android device and select **"Add to Home Screen"** to install the PWA natively.

---

*Made for Mama and Papa Disqo.*