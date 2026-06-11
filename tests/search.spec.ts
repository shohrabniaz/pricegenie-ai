import { test, expect } from "@playwright/test";

test.describe("Product search", () => {
  test("search returns PS5 results", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("search-input").fill("ps5");
    await page.getByTestId("search-submit").click();

    await expect(page).toHaveURL(/\/search\?q=ps5/);
    await expect(page.getByText(/result/i)).toBeVisible();
    await expect(page.getByTestId("product-card-ps5-slim")).toBeVisible();
  });

  test("search page browses full catalog without query", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByText(/Browse all \d+ products/i)).toBeVisible();
    await expect(page.getByTestId("product-card-iphone-17-pro-256")).toBeVisible();
  });

  test("Kmart electronics appear in search", async ({ page }) => {
    await page.goto("/search?q=kmart");
    await expect(page.getByTestId("product-card-kmart-wireless-earbuds")).toBeVisible();
  });
});
