/**
 * Pre-launch validation — run before marketing push or enabling auth in production.
 *
 * Usage: npm run launch:check
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SEO_GUIDES } from "../src/data/seo-guides";
import { isAuthRequired } from "../src/lib/auth-config";
import { APP_NAME } from "../src/lib/brand";

const ROOT = process.cwd();
let failed = 0;

function pass(msg: string) {
  console.log(`✓ ${msg}`);
}

function fail(msg: string) {
  console.log(`✗ ${msg}`);
  failed += 1;
}

console.log(`${APP_NAME} — launch readiness check\n`);

if (isAuthRequired()) {
  fail(
    "Auth gate is ON — public launch should leave NEXT_PUBLIC_AUTH_ENABLED unset"
  );
} else {
  pass("Auth gate is off (public launch mode)");
}

if (process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG) {
  pass("Amazon affiliate tag configured");
} else {
  console.log("· Amazon affiliate tag not set (optional for launch)");
}

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
  version: string;
};
pass(`Package version ${pkg.version}`);

if (SEO_GUIDES.length >= 6) {
  pass(`${SEO_GUIDES.length} SEO buying guides`);
} else {
  fail(`Expected ≥6 SEO guides, found ${SEO_GUIDES.length}`);
}

try {
  const manifest = JSON.parse(
    readFileSync(join(ROOT, "public/manifest.json"), "utf8")
  ) as { name: string; short_name: string };
  if (manifest.name === APP_NAME && manifest.short_name === APP_NAME) {
    pass("PWA manifest uses PriceGenie AI branding");
  } else {
    fail("PWA manifest name mismatch");
  }
} catch {
  fail("Could not read public/manifest.json");
}

try {
  readFileSync(join(ROOT, "src/data/price-snapshots.json"), "utf8");
  pass("Price snapshots file present");
} catch {
  fail("Missing src/data/price-snapshots.json");
}

console.log(`\n--- ${failed === 0 ? "Launch checks passed" : `${failed} check(s) failed`} ---\n`);
process.exit(failed > 0 ? 1 : 0);
