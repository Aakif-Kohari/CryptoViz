import { expect, test } from "@playwright/test";

test("dark mode toggle changes the document theme when available", async ({ page }) => {
  await page.goto("/");

  const toggle = page.locator(
    'button[aria-label*="dark" i], button[aria-label*="theme" i], [data-theme-toggle]',
  ).first();

  test.skip(!(await toggle.count()), "CryptoViz theme toggle is not exposed with a detectable accessible hook.");

  const before = await page.locator("html").getAttribute("class");
  await toggle.click();
  await page.waitForTimeout(150);

  const after = await page.locator("html").getAttribute("class");
  expect(after).not.toBe(before);
});
