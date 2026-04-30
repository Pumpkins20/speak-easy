import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

async function preparePage(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });

  await page.waitForFunction(
    () => !document.fonts || document.fonts.status === "loaded",
  );

  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition-duration: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        caret-color: transparent !important;
      }

      html {
        scroll-behavior: auto !important;
      }

      .fade-in {
        opacity: 1 !important;
        transform: none !important;
      }

      .brand-reveal {
        display: none !important;
      }
    `,
  });
}

test.describe("landing visual regression", () => {
  test("landing desktop", async ({ page }) => {
    await page.setViewportSize(desktopViewport);
    await preparePage(page, "/");

    await expect(page.locator("body")).toHaveScreenshot("landing-desktop.png", {
      fullPage: true,
    });
  });

  test("landing mobile", async ({ page }) => {
    await page.setViewportSize(mobileViewport);
    await preparePage(page, "/");

    await expect(page.locator("body")).toHaveScreenshot("landing-mobile.png", {
      fullPage: true,
    });
  });
});

test.describe("conversation visual regression", () => {
  test("conversation desktop", async ({ page }) => {
    await page.setViewportSize(desktopViewport);
    await preparePage(page, "/conversation");

    await expect(page.getByRole("heading", { name: "Latihan Conversation" })).toBeVisible();

    await expect(page.locator("body")).toHaveScreenshot(
      "conversation-desktop.png",
      {
        fullPage: true,
      },
    );
  });

  test("conversation mobile", async ({ page }) => {
    await page.setViewportSize(mobileViewport);
    await preparePage(page, "/conversation");

    await expect(page.getByRole("heading", { name: "Latihan Conversation" })).toBeVisible();

    await expect(page.locator("body")).toHaveScreenshot("conversation-mobile.png", {
      fullPage: true,
    });
  });
});
