import { test, expect } from "@playwright/test";

test.describe("Product detail", () => {
  test("shows direct product link when PDP is known", async ({ page }) => {
    await page.goto("/product/anker-735-charger");

    await expect(
      page.getByRole("heading", { name: /Anker 735 GaN Charger/i })
    ).toBeVisible();
    await expect(page.getByTestId("price-table")).toBeVisible();

    const storeLink = page.getByTestId("view-product-link").first();
    await expect(storeLink).toBeVisible();
    await expect(storeLink).toContainText(/View product/i);

    const href = await storeLink.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toMatch(/amazon\.com\.au\/dp\//i);
  });

  test("shows product-scoped retailer links when PDP is not cached", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/product/ps5-slim");

    await expect(page.getByRole("heading", { name: /PlayStation 5/i })).toBeVisible();
    await expect(page.getByTestId("price-table")).toBeVisible();

    const storeLinks = page.getByTestId("view-product-link");
    await expect(storeLinks.first()).toBeVisible();

    const href = await storeLinks.first().getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toMatch(/search|s\?k=|catalogsearch/i);
    expect(href?.toLowerCase()).toContain("playstation");
  });

  test("wait or buy advice is shown", async ({ page }) => {
    await page.goto("/product/iphone-17-pro-256");
    await expect(page.getByText(/Wait or Buy/i)).toBeVisible();
  });
});
