# Launch Checklist — PriceGenie AI

Use this before sharing the app publicly or turning on auth in production.

## Automated

```bash
npm run launch:check   # public auth mode, guides, manifest, snapshots
npm run check          # lint, tests, sanity, build
```

## Production (Vercel)

| Item | Status | Notes |
|------|--------|-------|
| Site live at pricegenie-ai.vercel.app | ☐ | Auto-deploy on `main` |
| **Auth gate OFF** | ☐ | Do not set `NEXT_PUBLIC_AUTH_ENABLED` until you want accounts |
| Firebase vars | ☐ | Only needed when enabling auth |
| Vercel Analytics enabled | ☐ | Project → Analytics |
| Speed Insights enabled | ☐ | Optional |
| Amazon affiliate tag | ☐ | `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` when approved |

## Data pipeline

| Item | Status | Notes |
|------|--------|-------|
| Daily price refresh workflow | ☐ | Actions → Daily price refresh |
| `scrape-metrics.json` updating | ☐ | Check workflow summary for per-retailer stats |
| Deep links improving over time | ☐ | Re-run daily; PDP cache fills in |

## Product smoke test

| Flow | ☐ |
|------|---|
| Homepage → search → product detail | |
| Student Mode toggle changes prices | |
| Paste URL on `/analyze` | |
| Genie advisor responds | |
| Buying guide `/best/best-laptops-under-1000-australia` | |
| Footer shows **PriceGenie AI** (no GitHub link) | |

## Marketing Phase 0 (CEO)

| Action | ☐ |
|--------|---|
| 3 demo videos (Student Mode, True Price, Genie) | |
| Post r/australia + uni Facebook groups | |
| TikTok / Instagram @pricegenie.ai | |

**Target:** 500 users, 50 daily searches before monetization.

## When to enable auth

Set `NEXT_PUBLIC_AUTH_ENABLED=true` + Firebase vars when you are ready for:

- Cloud price alerts (v0.7)
- Saved preferences per account
- Rate limiting Genie abuse

Until then, keep the site **public**.
