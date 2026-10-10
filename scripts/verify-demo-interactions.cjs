// Run with a server available at BASE_URL (defaults to localhost:3000).
// Prefer `next start` for final checks: development overlays can obscure controls.
// Requires playwright-core, or PLAYWRIGHT_MODULE pointing to an existing installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const artifacts = path.resolve('.next/interaction-audit');

async function recordRun(page, nodeSelector, runSelector, doneClass) {
  await page.evaluate(({ nodeSelector, runSelector, doneClass }) => {
    const nodes = [...document.querySelectorAll(nodeSelector)];
    window.demoTimeline = [];
    let start = 0;
    let previous = 0;
    const observer = new MutationObserver(() => {
      const count = nodes.filter(node => node.classList.contains(doneClass)).length;
      if (count !== previous) {
        window.demoTimeline.push({ count, elapsed: Math.round(performance.now() - start) });
        previous = count;
      }
      if (count === nodes.length) observer.disconnect();
    });
    document.querySelector(runSelector).addEventListener('click', () => {
      start = performance.now();
      nodes.forEach(node => observer.observe(node, { attributes: true, attributeFilter: ['class'] }));
    }, { once: true });
  }, { nodeSelector, runSelector, doneClass });
  await page.locator(runSelector).click();
  assert.equal(await page.locator(runSelector).isDisabled(), true);
  await page.waitForFunction(() => window.demoTimeline.length === 3);
  const timeline = await page.evaluate(() => window.demoTimeline);
  assert.deepEqual(timeline.map(event => event.count), [1, 2, 3]);
  timeline.forEach((event, index) => assert.ok(
    Math.abs(event.elapsed - (index + 1) * 450) < 200,
    `Unexpected workflow timing: ${JSON.stringify(timeline)}`,
  ));
  assert.equal(await page.locator(runSelector).isDisabled(), false);
  return timeline;
}

async function selected(buttons, index) {
  const states = await buttons.evaluateAll(elements => elements.map(el => el.getAttribute('aria-pressed')));
  assert.deepEqual(states, states.map((_, i) => String(i === index)));
}

async function checkReference(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(pathToFileURL(path.resolve('refs/Agency-Design-V4-Desktop.html')).href, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => [...document.querySelectorAll('iframe')].length > 0);
  const frame = page.frames().find(candidate => candidate.parentFrame());
  await frame.waitForSelector('[data-run-flow]');
  const timeline = await recordRun(frame, '.sd-node', '[data-run-flow]', 'is-done');
  const snapshots = {};
  for (const [name, button, target] of [
    ['leads', '[data-flow="leads"]', '.sd-workflow'],
    ['invoices', '[data-app="invoices"]', '.sd-appmain'],
    ['prototype', '[data-research="prototype"]', '.sd-document'],
    ['plan', '[data-research="plan"]', '.sd-document'],
    ['improved', '[data-compare="after"]', '.sd-compare'],
  ]) {
    await frame.locator(button).click();
    snapshots[name] = await frame.locator(target).innerText();
  }
  const inventoryBackground = await frame.locator('[data-app="invoices"]').evaluate(el => getComputedStyle(el).backgroundColor);
  assert.equal(inventoryBackground, 'rgba(0, 0, 0, 0)');
  await page.close();
  return { timeline, snapshots, inventoryBackground };
}

async function checkLocale(browser, locale, width, reference) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${baseUrl}/${locale}`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html {scroll-behavior:auto!important}' });
  const compareReference = async (name, selector) => {
    if (locale !== 'en') return;
    const normalize = text => text.replace(/[✓□✦◌○⌖⌘]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    assert.equal(normalize(await page.locator(selector).innerText()), normalize(reference.snapshots[name]));
  };
  const automationTabs = page.locator('#automation .tabs button');
  const run = page.locator('#automation .mini-button');
  const initialFlow = await page.locator('#automation-workflow').innerText();
  const idleStatus = await page.locator('#automation [role=status]').innerText();
  const timeline = await recordRun(page, '#automation .flow-node', '#automation .mini-button', 'done');
  await automationTabs.nth(1).click();
  await compareReference('leads', '#automation-workflow');
  await selected(automationTabs, 1);
  assert.notEqual(await page.locator('#automation-workflow').innerText(), initialFlow);
  assert.equal(await page.locator('.flow-node.done').count(), 0);
  assert.equal(await page.locator('#automation [role=status]').innerText(), idleStatus);
  await recordRun(page, '#automation .flow-node', '#automation .mini-button', 'done');
  const leadStatus = await page.locator('#automation [role=status]').innerText();
  await run.click(); // Replay must restart, not toggle all steps off permanently.
  await page.waitForFunction(() => document.querySelectorAll('.flow-node.done').length === 1);
  await page.locator('#automation .demo').screenshot({ path: path.join(artifacts, `${locale}-${width}-workflow-first-step.png`) });
  await automationTabs.first().click(); // Switching mid-run cancels queued steps.
  await page.waitForTimeout(1500);
  assert.equal(await page.locator('.flow-node.done').count(), 0);
  assert.equal(await page.locator('#automation-workflow').innerText(), initialFlow);
  assert.equal(await run.isDisabled(), false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await run.click();
  assert.equal(await page.locator('.flow-node.done').count(), 3);
  assert.notEqual(await page.locator('#automation [role=status]').innerText(), leadStatus);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('#automation .demo').screenshot({ path: path.join(artifacts, `${locale}-${width}-workflow.png`) });

  const softwareTabs = page.locator('#custom .app-tabs button');
  const inventory = await page.locator('#software-table').innerText();
  await softwareTabs.nth(1).focus();
  await page.keyboard.press('Enter');
  await selected(softwareTabs, 1);
  await compareReference('invoices', '#custom .app-main');
  assert.match(await page.locator('#software-table').innerText(), /INV-001[\s\S]*INV-002[\s\S]*INV-003/);
  assert.equal(await softwareTabs.nth(1).evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
  await page.locator('#custom .demo').screenshot({ path: path.join(artifacts, `${locale}-${width}-invoices.png`) });
  await softwareTabs.first().focus();
  await page.keyboard.press('Space');
  await selected(softwareTabs, 0);
  assert.equal(await page.locator('#software-table').innerText(), inventory);
  assert.equal(await softwareTabs.first().evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
  await softwareTabs.first().blur();
  await page.locator('#custom .demo').screenshot({ path: path.join(artifacts, `${locale}-${width}-inventory.png`) });

  const slots = page.locator('#apps .booking button');
  for (let i = 0; i < 3; i++) {
    await slots.nth(i).click();
    await selected(slots, i);
    assert.equal(await page.locator('.phone b').textContent(), ['10:00', '11:30', '14:00'][i]);
  }

  const researchTabs = page.locator('#research .research-tabs button');
  const documents = new Set();
  for (const index of [0, 1, 2, 0]) {
    await researchTabs.nth(index).click();
    await selected(researchTabs, index);
    documents.add(await page.locator('#research-document').innerText());
    if(index > 0) await compareReference(index === 1 ? 'prototype' : 'plan', '#research-document');
    await page.locator('#research .demo').screenshot({ path: path.join(artifacts, `${locale}-${width}-research-${index}.png`) });
  }
  assert.equal(documents.size, 3);

  const maintenanceTabs = page.locator('#maintenance .tabs button');
  const before = await page.locator('#maintenance-preview').innerText();
  await maintenanceTabs.last().click();
  await selected(maintenanceTabs, 1);
  await compareReference('improved', '#maintenance .demo');
  assert.notEqual(await page.locator('#maintenance-preview').innerText(), before);
  assert.equal(await page.locator('#maintenance .is-after').count(), 1);
  await page.locator('#maintenance .demo').screenshot({ path: path.join(artifacts, `${locale}-${width}-improved.png`) });
  await maintenanceTabs.first().click();
  assert.equal(await page.locator('#maintenance-preview').innerText(), before);
  assert.equal(await page.locator('#maintenance .is-after').count(), 0);

  // These two reference cards are intentionally illustrative, not controls.
  assert.equal(await page.locator('#support button, #seo button').count(), 0);
  for (const summary of await page.locator('.work-card summary').all()) {
    await summary.focus();
    await page.keyboard.press('Enter');
    assert.equal(await summary.locator('..').getAttribute('open'), '');
    await page.keyboard.press('Enter');
    assert.equal(await summary.locator('..').getAttribute('open'), null);
  }
  await page.locator('.contact-form button').click();
  assert.equal(await page.locator('.form-status').count(), 0);
  await page.locator('[name=name]').fill(locale === 'ar' ? 'أحمد' : 'Test visitor');
  await page.locator('[name=email]').fill('test@example.com');
  await page.locator('textarea').fill(locale === 'ar' ? 'مشروع تجريبي' : 'Test project');
  await page.locator('.contact-form button').click();
  assert.ok(await page.locator('.form-status').isVisible());
  const previews = new Set();
  for (const button of await page.locator('.footer-links button').all()) {
    await button.click();
    previews.add(await page.locator('.contact-preview-status').innerText());
  }
  assert.equal(previews.size, 3);
  await page.locator('.whatsapp').click();
  assert.equal(await page.locator('.whatsapp-card').count(), 1);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.whatsapp-card').count(), 0);
  assert.equal(await page.locator('.whatsapp').evaluate(el => el === document.activeElement), true);
  await page.locator('.whatsapp').click();
  await page.locator('.whatsapp-card button').click();
  assert.equal(await page.locator('.whatsapp-card').count(), 0);
  if (width < 590) {
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator('.menu').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.menu').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('.menu').evaluate(el => el === document.activeElement), true);
    await page.locator('.menu').click();
    await page.locator('.nav a[href="#work"]').click();
    assert.equal(await page.locator('.menu').getAttribute('aria-expanded'), 'false');
  }
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  await page.close();
  return { locale, width, timeline, errors };
}

(async () => {
  await fs.mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const reference = await checkReference(browser);
    console.log('Reference inspected:', JSON.stringify(reference));
    const results = [];
    for (const locale of ['en', 'ar']) {
      for (const width of [1440, 390]) {
        const result = await checkLocale(browser, locale, width, reference);
        results.push(result);
        console.log('Passed:', JSON.stringify(result));
      }
    }
    await fs.writeFile(path.join(artifacts, 'results.json'), JSON.stringify({ reference, results }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
