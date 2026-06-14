# Changelog

All notable changes to PriceGenie AI are documented here.

## [0.4.1] - 2026-06-12

### Added
- **Price history log** — daily scraper appends best store price to `price-history-log.json`; merged into product charts at runtime
- **SEO buying guides** — `/best/[slug]` pages (laptops under $1k, student laptops, gaming monitors) + `sitemap.xml`
- Footer links for Analyze URL and buying guides

### Changed
- Daily price refresh workflow commits `price-history-log.json` alongside snapshots

## [0.4.0] - 2026-06-12

### Added
- **Search engine model** — `GET /api/search` merges catalog + daily snapshots + priority AU retailer links
- **Paste any product URL** — `/analyze` page + `POST /api/analyze-url` (JSON-LD / meta price extraction)
- **Affiliate links** — `src/lib/affiliate.ts` for Amazon AU & eBay AU outbound URLs
- Retailer search links on search results (Amazon, eBay, JB Hi-Fi, Good Guys, Officeworks, Harvey Norman, Kogan)
- Homepage CTA → Analyze; **Analyze** in main nav

### Changed
- Search page fetches unified API instead of static `searchProducts()` only
- README documents search-on-demand architecture (not millions of imported SKUs)

## [0.3.9] - 2026-06-12

### Added
- **Automated daily price refresh** — GitHub Actions workflow (2 AM Sydney) scrapes retailer search pages
- `npm run prices:fetch-live` — Playwright scraper writes `price-snapshots.json` and updates review date
- Plausibility checks so bad scrapes keep the last known price

## [0.3.8] - 2026-06-12

### Added
- **Prices last updated** badge on product pages and search cards
- Live price feed scaffold: `/api/prices/[id]`, `price-snapshots.ts`, `npm run prices:refresh`
- Optional `PRICE_FEED_URL` env for hosted JSON price overrides

## [0.3.7] - 2026-06-12

### Added
- Central coupon rules engine (`src/lib/coupon-rules.ts`) — discounts only apply when eligibility rules pass
- `checkoutPrice` vs `truePrice` (cashback) separation in price breakdown
- Pricing verification for all 80 products in sanity check + unit tests

### Changed
- **Store price** = retailer website price (no codes); deals shown separately
- Product cards and product page lead with store price, not pre-applied discounts
- Removed legacy per-offer coupon/student fields — rules resolved at calculation time
- Invalid codes (GAME30, MONITOR30, etc.) no longer auto-applied

## [0.3.6] - 2026-06-12

### Changed
- Author display name updated to **Shohrab Hossen Niaz** (`src/lib/author.ts`)
- Genie AI: smarter intent routing, multi-strategy search, price/detail/compare replies, chat follow-up context

### Fixed
- Mobile typography: fixed 16px root size, Geist font on body, consistent input/button font sizing across pages

## [0.3.5] - 2026-06-12

### Added
- Vercel Analytics + Speed Insights (page views, Web Vitals, custom events)
- Custom events: `search`, `genie_message`, `student_mode_toggle` (no query text logged)

### Changed
- README and launch plan updated with live URL [pricegenie-ai.vercel.app](https://pricegenie-ai.vercel.app)

## [0.3.4] - 2026-06-12

### Changed
- AI assistant renamed from **Niaz** to **Genie** (`src/lib/brand.ts` single source of truth)
- Sparkles icon for Genie in nav, chat header, and homepage CTA

### Fixed
- Mobile UX: safe-area insets, `100dvh` advisor layout, 44px touch targets, pinch-zoom enabled
- Advisor chat fills mobile viewport; footer hidden on `/advisor` for small screens
- Horizontally scrollable suggestion chips on mobile; larger chat input (`text-base` on mobile)

## [0.3.3] - 2026-06-12

### Added
- `vercel.json` with Sydney region and production build settings
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Vercel + GitHub Actions CD guide

### Changed
- React 19.2.4 → 19.2.7 (grouped Dependabot update)
- GitHub Actions: checkout v6, setup-node v6, github-script v9, CodeQL v4, docker/build-push-action v7
- CD workflow writes deploy URL to job summary and environment

### Fixed
- Dependabot: ignore `@types/node` major bumps; group GitHub Actions updates

## [0.3.2] - 2026-06-12

### Fixed
- Docker image: Alpine package upgrades for OpenSSL CVEs
- Dependency override for picomatch ReDoS CVE (Trivy scan)
- Trivy action uses `@v0.36.0` tag convention

## [0.3.1] - 2026-06-12

### Fixed
- CI E2E: unique header/footer logo test IDs; `next start` works outside Docker builds
- Docker workflow: valid Trivy action version; standalone output only in Docker builds
- Dependabot: group `react` and `react-dom` to avoid peer dependency conflicts

## [0.3.0] - 2026-06-12

### Added
- Vitest unit test framework with code coverage thresholds
- Docker multi-stage build (`Dockerfile`, `docker-compose.yml`)
- GitHub Actions: expanded CI, security (npm audit + CodeQL), Docker (Trivy + GHCR), CD (Vercel)
- Dependabot for npm and GitHub Actions
- DevOps documentation (`docs/DEVOPS.md`, `CONTRIBUTING.md`, `SECURITY.md`)

### Changed
- `npm run check` now includes typecheck and unit tests
- Next.js `standalone` output for container deployments

## [0.2.2] - 2026-06-12

### Changed
- Minimal inline SVG logo that blends with the dark UI (no white box)
- Wordmark uses site slate + teal accents; icon-only on small screens

## [0.2.1] - 2026-06-12

### Changed
- Replaced gradient placeholder with official PriceGenie AI logo (genie lamp + price tags)
- Updated favicon, PWA icons, and theme color to navy & gold brand palette

## [0.2.0] - 2026-06-12

### Added
- Step-by-step **True Price explainer** on product pages (coupons, student discounts, shipping, cashback)
- Per-store expandable price breakdown list
- Real product & brand images (replaces emoji placeholders)
- Niaz AI shopping assistant branding

### Changed
- Shop links open product-specific retailer search pages
- Expanded catalog to 80+ products including Kmart and electronics
- Playwright E2E test suite with CI integration

## [0.1.0] - 2026-06-12

### Added
- Initial PriceGenie AI MVP
- Product search, true price comparison, coupons, student mode
- Price alerts, wait-or-buy advice, AI advisor
