# Touch Light Regulator

Fast, accessible slider app to adjust virtual light intensity.

## Features
- Responsive UI with dark/light theme
- Shareable state via URL (e.g., `?i=128`)
- Local persistence
- PWA offline support (service worker + manifest)
- Ultra-fast build via esbuild

## Getting started

- Development server:
```bash
npm run dev
```

- Build for production:
```bash
npm install
npm run build
```

- Serve built files:
```bash
npm run serve
```

Open `http://localhost:8080/`.

## Structure
- `index.html` – markup, meta, and layout
- `style.css` – theming and responsive styles
- `script.js` – slider logic, URL sync, persistence, PWA registration
- `manifest.webmanifest` – PWA manifest
- `sw.js` – service worker (cache-first for app shell)

## Notes
- Icons: `favicon.svg` provided. Optionally add `icon-192.png` and `icon-512.png` for install prompts.