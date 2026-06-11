import { test, expect } from "@playwright/test";

test.describe("Niaz AI assistant", () => {
  test("responds to a shopping question", async ({ page }) => {
    await page.goto("/advisor");

    await expect(page.getByRole("heading", { name: "Niaz" })).toBeVisible();
    await expect(page.getByTestId("advisor-input")).toBeVisible();
    await page.getByTestId("advisor-input").fill("Best gaming laptop under $2,100?");
    await page.getByTestId("advisor-send").click();

    await expect(page.getByTestId("advisor-response").last()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId("advisor-response").last()).toContainText(
      /true price|Top \d+ picks/i
    );
  });

  test("handles compare queries", async ({ page }) => {
    await page.goto("/advisor");

    await page.getByTestId("advisor-input").fill("compare airpods vs galaxy buds");
    await page.getByTestId("advisor-send").click();

    const response = page.getByTestId("advisor-response").last();
    await expect(response).toBeVisible({ timeout: 10_000 });
    await expect(response).toContainText(/Verdict/i);
  });
});
