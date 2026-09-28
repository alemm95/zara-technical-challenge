import { expect, type Page, test } from "@playwright/test";

test.skip(
  process.env.E2E_LIVE_API !== "1",
  "Set E2E_LIVE_API=1 to run against the real phones API.",
);

function collectConsoleProblems(page: Page) {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") {
      problems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));

  return problems;
}

const searchbox = (page: Page) =>
  page.getByRole("textbox", {
    name: "Search for a smartphone by name or brand",
  });

test.describe("live API", () => {
  test.setTimeout(90_000);

  test("catalog renders the search from the URL on the server", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/?search=samsung");
    await page.waitForLoadState("networkidle");

    await expect(searchbox(page)).toHaveValue("samsung");
    await expect(
      page.getByRole("status").filter({ hasText: /RESULTS/ }),
    ).toHaveText(/^\d+ RESULTS$/);
    const hrefs = await page
      .getByRole("link", { name: /EUR$/ })
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.every((href) => href?.endsWith("?search=samsung"))).toBe(true);
    expect(problems).toEqual([]);
  });

  test("typing updates the URL and survives a reload", async ({ page }) => {
    await page.goto("/");

    await searchbox(page).fill("apple");
    await expect(page).toHaveURL(/\?search=apple$/);
    await expect(
      page.getByRole("link", { name: /EUR$/ }).first(),
    ).toBeVisible();

    await page.reload();
    await expect(searchbox(page)).toHaveValue("apple");
  });

  test("detail lets you configure a phone and find it in the cart", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/product/SMG-S24U?search=samsung");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("link", { name: /BACK/ })).toHaveAttribute(
      "href",
      "/?search=samsung",
    );
    await expect(page.getByRole("button", { name: "AÑADIR" })).toBeDisabled();

    await page.getByRole("radio", { name: "512 GB" }).check();
    await page.getByRole("radio", { name: "Titanium Black" }).check();
    await expect(page.getByRole("button", { name: "AÑADIR" })).toBeEnabled();
    await page.getByRole("button", { name: "AÑADIR" }).click();
    await expect(
      page.getByRole("link", { name: "Shopping bag, 1 item" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Shopping bag, 1 item" }).click();
    await expect(page.getByRole("heading", { name: "CART (1)" })).toBeVisible();
    await expect(page.getByText("512 GB | Titanium Black")).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("an unknown product renders the not-found page", async ({ page }) => {
    await page.goto("/product/does-not-exist");

    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
  });
});
