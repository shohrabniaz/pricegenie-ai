# Deployment Guide — PriceGenie AI

Production deployment uses **Vercel** with optional **GitHub Actions CD** from [`.github/workflows/cd.yml`](../.github/workflows/cd.yml).

## Option A: Vercel dashboard (recommended for first deploy)

1. Sign in at [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New Project** → import `shohrabniaz/pricegenie-ai`.
3. Framework preset: **Next.js** (auto-detected).
4. Build settings (also in [`vercel.json`](../vercel.json)):
   - Install: `npm ci`
   - Build: `npm run build`
   - Region: **Sydney (syd1)**
5. Deploy. Vercel auto-deploys on every push to `main`.

### Analytics (built-in)

Vercel **Analytics** and **Speed Insights** are included in the app. On Vercel:

1. Project → **Analytics** → enable Web Analytics (free tier).
2. Project → **Speed Insights** → enable (optional, recommended).

Custom events appear under **Analytics → Events**:

| Event | When |
|-------|------|
| `search` | User submits a search (`query_length` only) |
| `genie_message` | User sends a message to Genie (`message_length` only) |
| `student_mode_toggle` | Student Mode turned on/off |

No extra env vars required on Vercel.

### Daily automated prices

[`.github/workflows/price-refresh.yml`](../.github/workflows/price-refresh.yml) runs every day at **~2:00 AM Sydney**:

1. Scrapes in-stock offers via Playwright (JB Hi-Fi, Kmart, Amazon AU, etc.)
2. Writes `src/data/price-snapshots.json` and bumps `CATALOG_PRICE_UPDATED_AT`
3. Commits to `main` if prices changed → Vercel redeploys

Manual run: **Actions → Daily price refresh → Run workflow**

Local test: `PRICE_REFRESH_LIMIT=3 npm run prices:fetch-live`

Optional environment variables (see [`.env.example`](../.env.example)):

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Live AI advisor (optional for MVP) |
| `NEXT_PUBLIC_*` | Client-side config if added later |

## Option B: GitHub Actions CD

Use this when you want deploy gated behind `npm run ci` in the CD workflow.

### 1. Create Vercel project

Follow Option A steps 1–5 once so a Vercel project exists.

### 2. Collect credentials

| Secret | Where to find it |
|--------|------------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) — create token with project scope |
| `VERCEL_ORG_ID` | Vercel → Project → **Settings** → **General** → Organization ID |
| `VERCEL_PROJECT_ID` | Same page → Project ID |

### 3. Add GitHub secrets

Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add all three: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

### 4. Trigger deploy

Push to `main` or run **CD** workflow manually (**Actions** → **CD** → **Run workflow**).

The workflow runs the full CI gate, then `vercel deploy --prod`. The deploy URL appears in the job summary.

### Skip behaviour

If `VERCEL_TOKEN` is not set, CD completes successfully but skips deploy (see workflow logs).

## Docker (alternative hosting)

For container-based hosting (Railway, Fly.io, AWS ECS, etc.):

```bash
docker pull ghcr.io/shohrabniaz/pricegenie-ai:latest
docker run -p 3000:3000 ghcr.io/shohrabniaz/pricegenie-ai:latest
```

See [`docs/DEVOPS.md`](DEVOPS.md) for build details.

## Post-deploy checklist

- [ ] Homepage loads with PriceGenie branding
- [ ] `/search` returns products
- [ ] `/product/ps5-slim` shows price explainer
- [ ] `/advisor` — Genie responds
- [ ] PWA manifest loads (`/manifest.json`)
- [ ] Vercel Analytics shows page views after a few minutes

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CD skips deploy | Add `VERCEL_*` secrets (Option B) or use Vercel GitHub integration (Option A) |
| Build fails on Vercel | Ensure Node 22 — set **Node.js Version** to `22.x` in Vercel project settings |
| Double deploys | Use either Vercel auto-deploy **or** GitHub CD, not both without coordination |
