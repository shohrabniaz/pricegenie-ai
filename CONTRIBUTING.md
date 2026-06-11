# Contributing to PriceGenie AI

Thank you for your interest in PriceGenie AI. This is a proprietary project by Shohrab Niaz; external contributions require prior approval.

## Getting started

1. Fork and clone the repository.
2. Use **Node 22** (`nvm use` — see `.nvmrc`).
3. Install dependencies: `npm ci`
4. Copy `.env.example` to `.env.local` if you need optional integrations.
5. Start the dev server: `npm run dev`

## Before opening a PR

Run the full local quality gate:

```bash
npm run check:all
```

Minimum for small changes:

```bash
npm run check
```

This runs lint, typecheck, unit tests, sanity checks, and production build.

## Pull request checklist

- [ ] `npm run check` passes
- [ ] Unit tests added/updated for logic changes in `src/lib/`
- [ ] E2E tests updated if UI flows change (`tests/`)
- [ ] CHANGELOG updated for user-facing changes
- [ ] Version bumped in `package.json` for releases

## Code style

- TypeScript strict mode — no `any` without justification
- ESLint via `eslint-config-next`
- Match existing component and naming patterns
- Keep changes focused; avoid unrelated refactors

## Testing

| Layer | Command | Location |
|-------|---------|----------|
| Unit | `npm run test` | `src/lib/__tests__/` |
| Coverage | `npm run test:coverage` | `coverage/` |
| Sanity | `npm run sanity` | `scripts/sanity-check.ts` |
| E2E | `npm run test:e2e` | `tests/` |

## Branching

- `main` — production-ready
- Feature branches: `feat/...`, `fix/...`, `chore/...`

## Questions

Contact **Shohrab Niaz**: shohrab.niaz@gmail.com
