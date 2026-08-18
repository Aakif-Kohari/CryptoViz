import { expect, test } from "@playwright/test";

test("main navigation does not expose broken internal destinations", async ({ page, request }) => {
  await page.goto("/");
  const links = await page.locator("a[href]").evaluateAll((anchors) =>
    Array.from(
      new Set(
        anchors
          .map((anchor) => (anchor as HTMLAnchorElement).href)
          .filter((href) => href.startsWith(new URL("/", location.origin).origin)),
      ),
    ).slice(0, 40),
  );

  for (const href of links) {
    const response = await request.get(href);
    expect(response.status(), `${href} returned ${response.status()}`).toBeLessThan(400);
  }
});
