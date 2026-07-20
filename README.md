# Grounded & Growing — The Life Planner

Marketing site for the **Grounded & Growing** undated life planner: a modern,
motivating single-page experience with a 3D mockup of the printed planner, a
page-flip preview of the real spreads, and an interactive "digital taste" of
the planner's method (intention, top 3, habits, self-care check-in).

Built with **Next.js (App Router) · TypeScript · Tailwind CSS v4**.
Design system — colors, typography, botanical art — is sampled directly from
the print-ready planner PDF.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Before launch

- **Etsy link** — replace `etsyUrl` in [`src/lib/site.ts`](src/lib/site.ts)
  with the live listing URL (currently a placeholder).
- **Price** — set the final price in the same file (placeholder `$34.00`).
- **Domain** — update `url` in `src/lib/site.ts` once the production domain
  exists (used for Open Graph / SEO metadata).

## Project map

| Path | What it is |
| --- | --- |
| `src/lib/site.ts` | Site-wide config: name, tagline, Etsy URL, price |
| `src/lib/content.ts` | All copy sourced from the planner (affirmations, quotes, features, FAQ) |
| `src/components/Hero.tsx` | Hero with CSS-3D planner mockup (`PlannerBook.tsx`) |
| `src/components/Flipbook.tsx` | Page-flip preview of real planner spreads |
| `src/components/AppPreview.tsx` | Interactive phone demo (localStorage only) |
| `public/planner/` | Page renders extracted from the print PDF |

## Deploy

Any Next.js host works; the simplest path is [Vercel](https://vercel.com):
import the GitHub repo and deploy with default settings.
