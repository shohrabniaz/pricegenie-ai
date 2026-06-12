# PriceGenie AI

[![CI](https://github.com/shohrabniaz/pricegenie-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/shohrabniaz/pricegenie-ai/actions/workflows/ci.yml)
[![Security](https://github.com/shohrabniaz/pricegenie-ai/actions/workflows/security.yml/badge.svg)](https://github.com/shohrabniaz/pricegenie-ai/actions/workflows/security.yml)
[![Docker](https://github.com/shohrabniaz/pricegenie-ai/actions/workflows/docker.yml/badge.svg)](https://github.com/shohrabniaz/pricegenie-ai/actions/workflows/docker.yml)

**Your wish for the best price granted.**

AI shopping genie that finds the true lowest price in Australia — compare JB Hi-Fi, Harvey Norman, The Good Guys, Amazon AU & more with coupons, student discounts, cashback, and shipping included.

Built by **Shohrab Niaz**.

## Features

| Feature | Description |
|---------|-------------|
| **True Price** | Final cost after coupons, student discounts, cashback & shipping |
| **Student Mode** | Auto-applies education pricing across retailers |
| **Coupon Finder** | Working codes with success rates |
| **AI Shopping Genie** | Ask what to buy, when to wait, budget recommendations |
| **Wait or Buy** | Sale timing advice based on price history |
| **Price Alerts** | Local alerts — no account, no cost |
| **PWA Ready** | Install on phone from browser (no app store fee for MVP) |

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Requires **Node 22** (see `.nvmrc`).

## Development & CI

```bash
npm run check        # lint + typecheck + unit tests + sanity + build
npm run check:all    # above + Playwright E2E
npm run test:coverage
npm run docker:up    # production container on :3000
```

| Workflow | Purpose |
|----------|---------|
| [CI](.github/workflows/ci.yml) | Lint, typecheck, unit tests, coverage, sanity, build, E2E |
| [Security](.github/workflows/security.yml) | npm audit + CodeQL |
| [Docker](.github/workflows/docker.yml) | Image build + Trivy scan + GHCR push |
| [CD](.github/workflows/cd.yml) | Vercel deploy (when secrets configured) |

Full details: [`docs/DEVOPS.md`](docs/DEVOPS.md) · [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) · [`CONTRIBUTING.md`](CONTRIBUTING.md) · [`SECURITY.md`](SECURITY.md)

## Tech Stack (100% Free Tier)

- **Next.js 16** — React framework
- **TypeScript** — Type safety
- **Tailwind CSS 4** — Styling
- **LocalStorage** — Price alerts (no backend cost)
- **PWA** — Mobile install without app store fees

### Optional (Free with Student Pack)

- **Vercel** — Free hosting
- **Firebase** — Auth & database when you scale
- **Groq / Ollama** — Free AI API (see `.env.example`)

## Project Structure

```
src/
├── app/           # Pages (search, product, coupons, student, advisor, alerts)
├── components/    # UI components
├── context/       # Student mode state
├── data/          # Product, coupon, retailer data (MVP seed data)
├── lib/           # Pricing engine, search, AI advisor, alerts
└── types/         # TypeScript types
```

## Roadmap

- [x] MVP — Search, compare, coupons, student mode, AI advisor
- [ ] Live price scraping / retailer APIs
- [ ] Firebase auth & cloud price alerts
- [ ] ShopBack / Cashrewards API integration
- [ ] Flutter or Capacitor native app
- [ ] NZ, UK, US expansion

## Marketing

See [`marketing/STRATEGY.md`](marketing/STRATEGY.md) for the full go-to-market plan.

## License

**Proprietary — All Rights Reserved.**

Copyright © 2026 Shohrab Niaz. See [LICENSE](LICENSE).

Unauthorized copying, distribution, or commercial use is prohibited.

## Author

**Shohrab Niaz**  
Email: shohrab.niaz@gmail.com  
GitHub: [@shohrabniaz](https://github.com/shohrabniaz)
