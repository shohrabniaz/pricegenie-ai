---
name: pricegenie-ai
description: Build, expand, and ship PriceGenie AI — Australia's AI shopping genie for true lowest prices. Use whenever working on PriceGenie AI, pricegenie-ai repo, product catalog, True Price engine, student mode, coupons, AI advisor, sanity tests, or deploying the app. Trigger even if the user only mentions adding products, fixing search, or pushing catalog updates.
---

# PriceGenie AI Development

## Product

**PriceGenie AI** — tagline: *Your wish for the best price granted.*

Australia-first shopping genie: True Price (coupons + student discounts + cashback + shipping), Wait or Buy, AI advisor, price alerts.

## Before shipping changes

Always run the full check:

```bash
npm run check
```

This runs lint → `scripts/sanity-check.ts` → production build. Do not push if any step fails.

## Adding products

1. Add entries to `src/data/catalog-extra.ts` using `catalogProduct()` and `offer()` from `src/data/product-helpers.ts`
2. Ensure unique `id`, at least one in-stock offer, and searchable `tags`
3. Run `npm run sanity` — catalog must stay ≥40 products with unique IDs
4. `/search` with no query browses all products automatically

## Key files

| Area | Path |
|------|------|
| Catalog (core + extra) | `src/data/products.ts`, `src/data/catalog-extra.ts` |
| True Price engine | `src/lib/pricing.ts` |
| Search | `src/lib/search.ts` |
| AI advisor | `src/lib/ai-advisor.ts` |
| Student mode | `src/context/StudentModeContext.tsx` |
| Sanity tests | `scripts/sanity-check.ts` |

## Deploy

- Free: Vercel + GitHub (`main` branch)
- PWA: `public/manifest.json` — no app store required for MVP

## License

Proprietary — Copyright Shohrab Hossen Niaz. Do not change LICENSE or remove author attribution.
