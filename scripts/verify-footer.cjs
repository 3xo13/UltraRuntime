// Run against a local production server; set PLAYWRIGHT_MODULE if needed.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert = require('node:assert/strict');

async function verifyFooter() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  try {
    for (const locale of ['en', 'ar']) {
      for (const width of [320, 390, 768, 1440]) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
          reducedMotion: 'reduce',
        });
        await page.goto(`${process.env.BASE_URL || 'http://localhost:3001'}/${locale}`);
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

        const backToTop = page.locator('.footer-bottom a');
        const copyright = await page.locator('.footer-bottom p').innerText();
        const linkBounds = await backToTop.boundingBox();
        const whatsAppBounds = await page.locator('.whatsapp').boundingBox();
        const overlaps = linkBounds.x < whatsAppBounds.x + whatsAppBounds.width
          && linkBounds.x + linkBounds.width > whatsAppBounds.x
          && linkBounds.y < whatsAppBounds.y + whatsAppBounds.height
          && linkBounds.y + linkBounds.height > whatsAppBounds.y;

        assert(!overlaps, 'Back to top must remain clear of WhatsApp');
        assert(await page.locator('.footer').evaluate((footer) =>
          parseFloat(getComputedStyle(footer).paddingBottom) <= 40), 'Keep the footer compact');
        assert(copyright.includes(String(new Date().getFullYear())));
        assert(copyright.includes(locale === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

        if (width === 390 || width === 1440) {
          await page.screenshot({ path: `.next/footer-${locale}-${width}.png` });
        }

        await backToTop.click();
        await page.waitForFunction(() => window.scrollY < 5);
        console.log({ locale, width, overlaps, backToTop: 'passed' });
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

verifyFooter().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
