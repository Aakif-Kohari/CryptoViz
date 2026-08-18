import { expect, test } from "@playwright/test";

test.describe("visual regression baselines", () => {
  test("home page visual baseline", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("home.png", { fullPage: true });
  });

  test("visualizer index visual baseline", async ({ page }) => {
    await page.goto("/visualizer/");
    await expect(page).toHaveScreenshot("visualizer-index.png", { fullPage: true });
  });

  test("Caesar visualizer visual baseline", async ({ page }) => {
    await page.goto("/visualizer/caesar/");
    await expect(page).toHaveScreenshot("caesar-visualizer.png", { fullPage: true });
  });
});
