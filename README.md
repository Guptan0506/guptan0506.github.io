# Navya Gupta Portfolio

This repository contains Navya Gupta's personal portfolio site and project showcase, deployed on GitHub Pages.

## Main Entry Points

- `index.html` — Portfolio homepage
- `resume.html` — Resume page with print/download behavior
- `projects/password-analyzer-case-study.html` — Password Analyzer case study
- `projects/fixmate-case-study.html` — FixMate case study

## Project Apps

All showcase app pages are organized under `projects/apps/`:

- `projects/apps/portable-linux-workstation/PortableLinuxWorkstation.html`
- `projects/apps/zombie-survival/ZombieSurvival.html`
- `projects/apps/tower-defense/TowerDefense.html`
- `projects/apps/e-commerce/e-commerceWebsite.html`
- `projects/apps/generative-art-creator/generativeArtCreator.html`
- `projects/apps/dodger-game/DodgerGame.html`
- `projects/apps/color-palette-generator/paletteGenerator.html`
- `projects/apps/pin-interests/Pin-interests.html`
- `projects/apps/recipe-keeper/recipeKeeper.html`

## SEO and Crawling

- `sitemap.xml` — Sitemap for indexed pages
- `robots.txt` — Crawler rules and sitemap reference

## Validation Scripts

- `scripts/check-links.js` — Validates local `href`/`src` targets
- `scripts/smoke-check.js` — Validates homepage routes, sitemap coverage, and key flow markers

Run checks from repo root:

```bash
node scripts/smoke-check.js
node scripts/check-links.js
```

## Notes

- The portfolio is a static site (no build step required).
- Project-specific images/assets are colocated with their project folders for consistency.
