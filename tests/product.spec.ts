import { test, expect } from "@playwright/test";

test.describe("Product detail", () => {
  test("shows price table with product-specific store links", async ({ page }) => {
    await page.goto("/product/ps5-slim");

    await expect(page.getByRole("heading", { name: /PlayStation 5/i })).toBeVisible();
    await expect(page.getByTestId("price-table")).toBeVisible();

    const storeLinks = page.getByTestId("view-product-link");
    await expect(storeLinks.first()).toBeVisible();

    const href = await storeLinks.first().getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).not.toMatch(/amazon\.com\.au\/?$/);
    expect(href).toMatch(/search|s\?k=|catalogsearch/i);
    expect(href?.toLowerCase()).toContain("playstation");
  });

  test("wait or buy advice is shown", async ({ page }) => {
    await page.goto("/product/iphone-17-pro-256");
    await expect(page.getByText(/Wait or Buy/i)).toBeVisible();
  });
});
