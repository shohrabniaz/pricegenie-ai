import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("homepage loads with PriceGenie branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/PriceGenie AI/i);
    await expect(page.getByTestId("hero-title")).toBeVisible();
    await expect(page.getByTestId("hero-title")).toContainText("granted");
    await expect(page.getByTestId("logo")).toBeVisible();
  });

  test("navigation links are reachable", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Search", exact: true }).first().click();
    await expect(page).toHaveURL(/\/search/);

    await page.getByRole("link", { name: "Coupons", exact: true }).first().click();
    await expect(page).toHaveURL(/\/coupons/);
    await expect(page.getByRole("heading", { name: "Coupon Codes" })).toBeVisible();

    await page.getByRole("link", { name: "Niaz", exact: true }).first().click();
    await expect(page).toHaveURL(/\/advisor/);
    await expect(page.getByTestId("advisor-input")).toBeVisible();
  });
});
