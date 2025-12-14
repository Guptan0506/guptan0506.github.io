# Navya Gupta — Portfolio Projects

This repository hosts multiple small web projects and demos by Navya Gupta. It is primarily a collection of static HTML/CSS/JS projects along with one React project (`query-performance-dashboard`).

## Contents

- `index.html` — Personal portfolio (links to sub-projects)
- `e-commerceWebsite.html` — ShopSphere demo (vanilla JS)
- `generativeArtCreator.html` — Generative art project
- `recipeKeeper.html` — Recipe Keeper demo
- `ToDoList.html` — To Do List demo
- `Pin-interests.html` — Pin Interests demo
- `ColorPaletteGenerator/` — Color palette generator (static HTML)
- `query-performance-dashboard/` — React app (Create React App)

## Quick start

To preview static pages (any `.html` files), open them directly in your browser or host with a simple static server:

```bash
# from repository root
python3 -m http.server 8080
# then open http://localhost:8080/index.html
```

To run the React app locally (inside `query-performance-dashboard`):

```bash
cd query-performance-dashboard
npm install
npm start
```

Accessibility checks (static pages):

```bash
# from repo root, serve files
python3 -m http.server 8080
# in another shell run
npx pa11y-ci
```

Accessibility checks (React app): run the test suite which includes `jest-axe` tests.

To build the React app for production:

```bash
npm run build
```

## Suggested improvements

- Add a root `LICENSE` (MIT recommended) and `CONTRIBUTING.md`.
- Add a GitHub Actions workflow to build and test the React app on push/PRs and (optionally) deploy to GitHub Pages.
	- A sample workflow (`.github/workflows/ci.yml`) has been added to run tests and build the `query-performance-dashboard` project, and deploy to GitHub Pages when commits land on `main`/`master`.
- Add automated linting and formatting (ESLint + Prettier) and basic tests.
	- The React app now includes a basic Prettier and ESLint setup; run `npm run lint` and `npm run format` from `query-performance-dashboard`.
- Add a `robots.txt` and `sitemap.xml` at repo root to help crawlers and improve SEO (a basic `sitemap.xml` has been added).
- Optimize images (compress, serve WebP/AVIF where possible) and enable caching headers on your hosting platform for better performance.

## Security audit & fixes ✅

- I ran `npm audit` across the repo and the `query-performance-dashboard` project and applied safe fixes.
- I added `overrides` in `query-performance-dashboard/package.json` to force updated patched versions for several transitive dependencies and reduced vulnerabilities from 15 to 3.
- The remaining issues are moderate vulnerabilities coming from `webpack-dev-server` (used by `react-scripts` for development). These are dev-time issues and do not affect production builds, but they can only be fully resolved by upgrading core build tooling (e.g., a new `react-scripts` release) or migrating the app to a different build tool such as Vite.

Decision: keep current setup (your choice) ✅

 - You chose to **keep the current Create React App setup** for `query-performance-dashboard` for now. The remaining vulnerabilities are development-time (dev server/tooling) and do not affect production builds. 
 - Mitigations and recommended maintenance steps:
	 - Continue to run `npm audit` regularly and apply safe fixes (`npm audit fix`).
	 - Monitor upstream `react-scripts` releases—when `react-scripts` updates (or a CRA team release) that includes fixes for those transitive deps, update the project promptly.
	 - For stricter protection, run security checks in CI and limit package install permissions on CI brokers for third-party code.
	 - Consider migrating to Vite later if you want faster builds and to remove dev-time vulnerabilities; this is a low-risk future migration I can prepare for if/when you want it.

If you'd like, I can still prepare a migration plan to Vite in a branch so it’s ready whenever you want it.
- Improve SEO: add Open Graph and Twitter metadata, sitemap, and consistent robots policy.
- Optimize and compress images and assets.
- Accessibility checks (e.g., axe) and ARIA improvements.

---

If you want, I can implement any of the above (CI workflow, LICENSE, linting, or add a root `package.json` for unified scripts). Tell me which ones you'd like me to do next.