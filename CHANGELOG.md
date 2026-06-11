# Changelog

All notable changes to PriceGenie AI are documented here.

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
