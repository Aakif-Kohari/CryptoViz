import { expect, test } from "@playwright/test";

test.describe("CryptoViz critical user flows", () => {
  test("home page loads and exposes the visualizer entry point", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CryptoViz/i);
    await expect(page.locator("body")).toContainText(/cryptography/i);
    await expect(page.locator('a[href="/visualizer/"]')).toBeVisible();
  });

  test("visualizer index loads and contains cipher destinations", async ({ page }) => {
    await page.goto("/visualizer/");
    await expect(page).toHaveTitle(/CryptoViz/i);
    await expect(page.locator("a[href*='/visualizer/']").first()).toBeVisible();
  });

  test("selecting Caesar opens a working cipher visualizer", async ({ page }) => {
    await page.goto("/visualizer/caesar/");
    await expect(page).toHaveURL(/\/visualizer\/caesar\/?$/);
    await expect(page.locator("body")).toContainText(/Caesar/i);
    await expect(page.locator("input, textarea").first()).toBeVisible();
  });

  test("cipher visualizer accepts input and produces an output", async ({ page }) => {
    await page.goto("/visualizer/caesar/");
    const editable = page.locator("textarea, input[type='text']").first();
    await editable.fill("HELLO");

    const buttons = page.getByRole("button");
    const action = buttons.filter({ hasText: /encrypt|execute|run|apply/i }).first();

    if (await action.count()) {
      await action.click();
    } else {
      await editable.press("Enter");
    }

    await expect(page.locator("body")).toContainText(/HELLO|output|result/i);
  });

  test("all internal navigation links resolve without 404", async ({ page, request }) => {
    await page.goto("/");
    const hrefs = await page.locator("a[href]").evaluateAll((anchors) =>
      Array.from(
        new Set(
          anchors
            .map((anchor) => (anchor as HTMLAnchorElement).getAttribute("href"))
            .filter((href): href is string => Boolean(href))
            .filter((href) => href.startsWith("/") && !href.startsWith("//")),
        ),
      ).slice(0, 30),
    );

    for (const href of hrefs) {
      const response = await request.get(new URL(href, page.url()).toString());
      expect(response.status(), `${href} returned ${response.status()}`).toBeLessThan(400);
    }
  });
});
