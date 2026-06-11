# Architecture

## Overview

PriceMate Australia is a Next.js 16 App Router application with client-side state for student mode and price alerts. MVP uses seed data; production will add retailer APIs and scraping.

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js App     │────▶│  Seed Data      │
│   (PWA)     │     │  (React 19)      │     │  products.ts    │
└─────────────┘     └──────────────────┘     └─────────────────┘
       │                     │
       │                     ▼
       │            ┌──────────────────┐
       └───────────▶│  LocalStorage    │
                    │  alerts, student │
                    └──────────────────┘
```

## Core Modules

### `lib/pricing.ts` — True Price Engine

Calculates final price per offer:

```
truePrice = listPrice - coupon - studentDiscount + shipping - cashback
```

Ranks offers and identifies best deal.

### `lib/search.ts` — Product Search

Fuzzy search across name, brand, tags, category. Supports budget and category filters.

### `lib/wait-or-buy.ts` — Sale Timing

Compares current true price vs historical low and Black Friday pricing. Returns buy/wait/neutral recommendation.

### `lib/ai-advisor.ts` — Shopping AI (MVP)

Rule-based intelligence over product catalog. Parses budget, category, and wait/buy intent. Upgrade path: Groq/Ollama API via `/api/advisor`.

### `context/StudentModeContext.tsx`

Global toggle persisted to localStorage. Affects all pricing calculations.

## Future Architecture (v2)

```
┌──────────┐    ┌─────────────┐    ┌────────────────┐
│  Client  │───▶│  API Routes │───▶│  Firestore     │
└──────────┘    └─────────────┘    └────────────────┘
                      │
                      ▼
               ┌────────────────┐
               │ Price Scraper  │
               │ (scheduled)    │
               └────────────────┘
```

- Firebase Auth for cloud sync
- Cloud Functions for price scraping cron
- FCM for push notifications
- Groq API for advanced AI

## Deployment

**Recommended:** Vercel (free hobby tier)

```bash
npm run build
# Vercel auto-deploys from GitHub
```

**Alternative:** Firebase Hosting, Cloudflare Pages (all free)
