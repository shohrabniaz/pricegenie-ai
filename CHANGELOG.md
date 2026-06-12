# Changelog

All notable changes to PriceGenie AI are documented here.

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
