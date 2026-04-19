# PrivacyKit HTML Demo

This repository is a tiny, framework-free demo showing how to use PrivacyKit in a plain HTML page:

- `consent-dialog` to display and manage consent
- `consent-guard` to block / conditionally load third-party resources
- `consent-missing` to show fallback UI when consent is missing

## Run locally

Prerequisites: Node.js + npm.

```bash
npm start
```

Then open the printed URL in your browser.

## What to look at

- `index.html` includes the PrivacyKit scripts from the CDN and demonstrates:
  - Guarded “scripts” (implemented as inline `type="text/plain"` blocks)
  - A guarded YouTube `<iframe>` using `data-src`
- `index.js` wires up the buttons, clears cookies for quick resets, and renders the guarded-script status cards.
- `index.css` contains the page styling and the PrivacyKit theme variables (CSS custom properties under `:root`).

## Notes

- The Google Tag Manager URL in `index.html` uses the placeholder `GTM-XXXXXXX`. Replace it with a real container ID if
  you want to test GTM loading behind consent.

