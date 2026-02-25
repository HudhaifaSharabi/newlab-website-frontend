# New Lab Specialized

Next.js (App Router) demo for a premium medical laboratory homepage with dual locales (Arabic default, English), Tailwind UI, next-intl i18n, dark/light theming, GSAP animations, and SEO schemas.

## Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/ar` (default) or `/en`.

## Notes
- Update `siteBaseUrl` and NAP values in `src/lib/seo.ts` for production.
- Replace placeholder visuals (hero block, map, badges) with real assets as needed.
- `Hero` placeholder box is where a future Three.js scene can mount; reuse the container with your renderer.