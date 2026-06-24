import { test, expect } from "@playwright/test";

test.describe("Product detail", () => {
  test("shows verified direct store link when PDP is known", async ({ page }) => {
    await page.goto("/product/anker-735-charger");

    await expect(
      page.getByRole("heading", { name: /Anker 735 GaN Charger/i })
    ).toBeVisible();
    await expect(page.getByTestId("price-table")).toBeVisible();

    const storeLink = page.getByTestId("view-product-link").first();
    await expect(storeLink).toBeVisible();

    const href = await storeLink.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toMatch(/amazon\.com\.au\/dp\//i);
    expect(href).not.toMatch(/\/s\?k=/i);
    expect(href).not.toMatch(/\/search/i);
  });

  test("does not show search fallback links while PDP is unverified", async ({
    page,
  }) => {
    await page.goto("/product/ps5-slim");

    await expect(page.getByRole("heading", { name: /PlayStation 5/i })).toBeVisible();
    await expect(page.getByTestId("price-table")).toBeVisible();
    await expect(page.getByTestId("view-product-link")).toHaveCount(0);
    await expect(page.getByText("Link verifying").first()).toBeVisible();
  });

  test("wait or buy advice is shown", async ({ page }) => {
    await page.goto("/product/iphone-17-pro-256");
    await expect(page.getByText(/Wait or Buy/i)).toBeVisible();
  });
});
