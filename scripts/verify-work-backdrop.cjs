const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert = require('node:assert/strict');

async function verifyBackdrop() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const locale of ['en', 'ar']) {
      for (const width of [390, 1440, 1846]) {
        const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${process.env.BASE_URL || 'http://localhost:3001'}/${locale}`);
        await page.evaluate(() => document.fonts.ready);
        const expectedGroups = {
          'automation-custom': ['automation', 'custom'],
          'apps-research': ['apps', 'research'],
          'maintenance-support': ['maintenance', 'support'],
          'seo-work': ['seo', 'work'],
          'approach-studio-contact': ['approach', 'studio', 'contact'],
        };
        assert.equal(await page.locator('[data-section-backdrop]').count(), 5);
        assert.equal(await page.locator('[data-section-backdrop] #contact').count(), 1);
        assert.equal(await page.locator('#seo').count(), 1);
        assert.equal(await page.locator('.artwork-layer').count(), 0);
        assert.equal(await page.locator('#approach').evaluate((element) =>
          getComputedStyle(element).backdropFilter), 'none', 'Avoid a full-width blur seam');
        for (const [name, sections] of Object.entries(expectedGroups)) {
          const pair = page.locator(`[data-section-backdrop="${name}"]`);
          assert.equal(await pair.locator(':scope > [aria-hidden="true"]').count(), 1);
          assert.deepEqual(await pair.locator(':scope > section').evaluateAll((nodes) =>
            nodes.map((node) => node.id)), sections);
          const artwork = pair.locator(':scope > [aria-hidden="true"]');
          assert.equal(await artwork.evaluate((element) => getComputedStyle(element).mixBlendMode), 'normal');
          assert.notEqual(await artwork.locator(':scope > div').evaluate((element) =>
            getComputedStyle(element).maskImage), 'none', 'Rotated image edges must be feathered');
          await pair.screenshot({ path: `.next/backdrop-${name}-${locale}-${width}.png` });
        }
        const group = page.locator('[data-section-backdrop="seo-work"]');
        assert.equal(await group.locator(':scope > [aria-hidden="true"]').count(), 1);
        assert.equal(await group.locator(':scope > section').count(), 2);
        await group.screenshot({ path: `.next/work-backdrop-${locale}-${width}.png` });
        await group.locator('summary').first().click();
        assert(await group.locator('details').first().evaluate((details) => details.open));
        const art = await group.locator(':scope > [aria-hidden="true"]').boundingBox();
        const bounds = await group.boundingBox();
        assert(art.y < bounds.y && art.y + art.height > bounds.y + bounds.height,
          'Feathered artwork extends beyond the expanded content');
        const finalArt = page.locator('[data-section-backdrop="approach-studio-contact"] > [aria-hidden="true"]');
        assert((await finalArt.locator(':scope > div').getAttribute('style')).includes('rotate(180deg)'));
        await page.waitForFunction(() => {
          const upper = document.querySelector('[data-connection="outgoing"]');
          const pair = document.querySelector('[data-connected-backdrops]');
          const bounds = upper.getBoundingClientRect();
          const expected = Math.max(bounds.width * 1.08, bounds.height + 128);
          return Math.abs(parseFloat(pair.style.getPropertyValue('--linked-sculpture-size')) - expected) < 1;
        });
        const linkedSizes = await page.locator('[data-connection] > [aria-hidden="true"] > div')
          .evaluateAll((images) => images.map((image) => {
            const style = getComputedStyle(image);
            const matrix = new DOMMatrix(style.transform);
            return { width: parseFloat(style.width), scale: Math.hypot(matrix.a, matrix.b) };
          }));
        assert.equal(linkedSizes.length, 2);
        assert.equal(linkedSizes[0].width, linkedSizes[1].width, 'Connected sculptures share one size');
        assert(linkedSizes.every((image) => Math.abs(image.scale - 1) < 0.001),
          'Rotation must not automatically enlarge a sculpture');
        const surfaces = page.locator('.demo:not(.device-demo), .browser, .work-card, #contact');
        for (const surface of await surfaces.all()) {
          assert((await surface.evaluate((element) => getComputedStyle(element).backdropFilter))
            .includes(`blur(${width === 390 ? 8 : 10}px)`));
        }
        await page.locator('#contact').screenshot({ path: `.next/contact-frost-${locale}-${width}.png` });
        await page.locator('#approach').evaluate((section) => window.scrollTo(0,
          section.getBoundingClientRect().top + window.scrollY - 180));
        await page.screenshot({ path: `.next/artwork-transition-${locale}-${width}.png` });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.deepEqual(errors, []);
        console.log({ locale, width, sharedBackdrop: 'passed', disclosure: 'passed' });
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

verifyBackdrop().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
