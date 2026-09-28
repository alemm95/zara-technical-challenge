import { expect, type Locator, type Page, test } from "@playwright/test";

const pixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const cartItem = {
  id: "s24-violet-512",
  product: {
    id: "SMG-S24U",
    brand: "Samsung",
    name: "Galaxy S24 Ultra",
    basePrice: 1329,
    imageUrl:
      "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U.webp",
  },
  color: {
    name: "Titanium Violet",
    hexCode: "#8E6F96",
    imageUrl:
      "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U-violet.webp",
  },
  storage: { capacity: "512 GB", price: 1229 },
};

async function openCart(
  page: Page,
  viewport: { width: number; height: number },
  items: unknown[] = [cartItem],
) {
  await page.setViewportSize(viewport);
  await page.route("**/_next/image**", (route) =>
    route.fulfill({ contentType: "image/png", body: pixelPng }),
  );
  await page.addInitScript((stored) => {
    localStorage.setItem("mbst-cart", JSON.stringify(stored));
  }, items);
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: `CART (${items.length})` }),
  ).toBeVisible();
}

async function box(locator: Locator) {
  const result = await locator.boundingBox();
  if (!result) {
    throw new Error("Element has no bounding box.");
  }

  return result;
}

function isHeaderLineVisible(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector("header");
    return (
      header !== null && getComputedStyle(header, "::after").display !== "none"
    );
  });
}

function hasHorizontalOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
}

const continueLink = (page: Page) =>
  page.getByRole("link", { name: "CONTINUE SHOPPING" });
const payButton = (page: Page) => page.getByRole("button", { name: "PAY" });
const total = (page: Page) => page.locator("footer p");
const cardImage = (page: Page) =>
  page.getByRole("link", { name: "Samsung Galaxy S24 Ultra" }).first();

test.describe("cart layout at 393px (mobile)", () => {
  test("stacks the total above two equal buttons without overflow", async ({
    page,
  }) => {
    await openCart(page, { width: 393, height: 852 });

    const [totalBox, continueBox, payBox, imageBox] = await Promise.all([
      box(total(page)),
      box(continueLink(page)),
      box(payButton(page)),
      box(cardImage(page)),
    ]);

    expect(imageBox.width).toBeCloseTo(160, 0);
    expect(totalBox.y + totalBox.height).toBeLessThanOrEqual(continueBox.y);
    expect(Math.abs(continueBox.y - payBox.y)).toBeLessThan(1);
    expect(Math.abs(continueBox.width - payBox.width)).toBeLessThan(1);
    expect(continueBox.width).toBeCloseTo((393 - 32 - 12) / 2, 0);
    expect(payBox.x - (continueBox.x + continueBox.width)).toBeCloseTo(12, 0);
    expect(await hasHorizontalOverflow(page)).toBe(false);
    expect(await isHeaderLineVisible(page)).toBe(false);
  });
});

test.describe("cart layout at 768px (tablet)", () => {
  test("uses a single footer row with vertically centered items", async ({
    page,
  }) => {
    await openCart(page, { width: 768, height: 1024 });

    const [totalBox, continueBox, payBox, imageBox] = await Promise.all([
      box(total(page)),
      box(continueLink(page)),
      box(payButton(page)),
      box(cardImage(page)),
    ]);
    const center = (b: { y: number; height: number }) => b.y + b.height / 2;

    expect(imageBox.width).toBeCloseTo(262, 0);
    expect(imageBox.height).toBeCloseTo(324, 0);
    expect(continueBox.width).toBeCloseTo(200, 0);
    expect(payBox.width).toBeCloseTo(260, 0);
    expect(continueBox.x).toBeCloseTo(40, 0);
    expect(payBox.x + payBox.width).toBeCloseTo(768 - 40, 0);
    expect(Math.abs(center(totalBox) - center(continueBox))).toBeLessThan(1);
    expect(Math.abs(center(payBox) - center(continueBox))).toBeLessThan(1);
    expect(await isHeaderLineVisible(page)).toBe(false);
  });
});

test.describe("cart layout at 1280px (desktop)", () => {
  test("matches the Figma footer and card dimensions", async ({ page }) => {
    await openCart(page, { width: 1280, height: 800 });

    const [footerBox, continueBox, payBox, imageBox] = await Promise.all([
      box(page.locator("footer")),
      box(continueLink(page)),
      box(payButton(page)),
      box(cardImage(page)),
    ]);

    expect(footerBox.height).toBeCloseTo(136, 0);
    expect(continueBox.width).toBeCloseTo(260, 0);
    expect(continueBox.height).toBeCloseTo(56, 0);
    expect(payBox.width).toBeCloseTo(260, 0);
    expect(payBox.height).toBeCloseTo(56, 0);
    expect(continueBox.x).toBeCloseTo(100, 0);
    expect(payBox.x + payBox.width).toBeCloseTo(1280 - 100, 0);
    expect(imageBox.width).toBeCloseTo(262, 0);
    expect(imageBox.height).toBeCloseTo(324, 0);
    expect(await isHeaderLineVisible(page)).toBe(true);
  });

  test("aligns logo, title and footer button on the 100px gutter", async ({
    page,
  }) => {
    await openCart(page, { width: 1280, height: 800 });

    const logo = await box(page.getByRole("link", { name: "MBST home" }));
    const title = await box(page.getByRole("heading", { name: "CART (1)" }));
    const continueBox = await box(continueLink(page));

    expect(logo.x).toBeCloseTo(100, 0);
    expect(title.x).toBeCloseTo(100, 0);
    expect(continueBox.x).toBeCloseTo(100, 0);
  });

  test("keeps Remove 40px above the card bottom", async ({ page }) => {
    await openCart(page, { width: 1280, height: 800 });

    const item = await box(page.getByRole("listitem"));
    const remove = await box(page.getByRole("button", { name: "Remove" }));

    expect(item.width).toBeCloseTo(548, 0);
    expect(item.height).toBeCloseTo(324, 0);
    expect(item.y + item.height - (remove.y + remove.height)).toBeCloseTo(
      40,
      0,
    );
  });
});

test.describe("cart states", () => {
  test("shows only the title and continue button when the cart is empty", async ({
    page,
  }) => {
    await openCart(page, { width: 1280, height: 800 }, []);

    await expect(continueLink(page)).toBeVisible();
    await expect(payButton(page)).toHaveCount(0);
    await expect(page.getByText("TOTAL")).toHaveCount(0);
  });

  test("keeps the browser console free of warnings and errors", async ({
    page,
  }) => {
    const messages: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning" || message.type() === "error") {
        messages.push(`${message.type()}: ${message.text()}`);
      }
    });

    await openCart(page, { width: 393, height: 852 });
    await page.waitForLoadState("networkidle");

    expect(messages).toEqual([]);
  });
});
