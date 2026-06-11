import { test, expect } from "@playwright/test";

test.describe("Student Mode", () => {
  test("toggles student mode on and off", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByTestId("student-mode-toggle");
    await expect(toggle).toBeVisible();

    await expect(toggle).toContainText("OFF");
    await toggle.click();
    await expect(toggle).toContainText("ON");
    await toggle.click();
    await expect(toggle).toContainText("OFF");
  });
});
