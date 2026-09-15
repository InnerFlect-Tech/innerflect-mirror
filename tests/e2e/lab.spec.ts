import { expect, test, type Page } from '@playwright/test';

/**
 * `/design/lab` — the composition contract, exercised.
 *
 * These cover the parts of WORLD_ELEMENTS.md request 13 that cannot honestly be
 * claimed from a typecheck: that an illegal placement is actually refused, that
 * an ordinary step cannot silently grow a second branch (criterion 4), that a
 * projection toggle preserves the selection (criterion 1), and that mobile
 * never creates WebGL (criterion 9).
 */

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 768;

/**
 * Open the lab and wait until it is actually interactive.
 *
 * Visible nodes are not enough: the route is server-rendered, so the markup is
 * on screen before React has attached a single handler, and a click in that
 * window is simply dropped. Waiting for the network to settle is what separates
 * "painted" from "listening" here — without it every first interaction in a
 * test silently does nothing and the assertion that follows blames the feature.
 */
async function openLab(page: Page) {
  await page.goto('/design/lab', { waitUntil: 'networkidle' });
  await expect(page.locator('.react-flow__node').first()).toBeVisible();
}

test.describe('/design/lab', () => {
  test('the seed graph is the three-step draft path, not a company', async ({ page }) => {
    await openLab(page);
    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(3);
    await expect(nodes.filter({ hasText: 'Step Node' })).toBeVisible();
    await expect(nodes.filter({ hasText: 'Decision Gate' })).toBeVisible();
    await expect(nodes.filter({ hasText: 'Outcome Marker' })).toBeVisible();
  });

  test('criterion 3 — an illegal placement is refused in the contract own words', async ({ page }) => {
    await openLab(page);
    const before = await page.locator('.react-flow__node').count();

    // Human Glyph is an attachment: it has no meaning standing on open canvas.
    await page.getByRole('button', { name: /^Human Glyph/ }).first().click();

    await expect(page.locator('output')).toContainText('attaches to a step');
    // The refusal has to actually refuse, not just narrate.
    await expect(page.locator('.react-flow__node')).toHaveCount(before);
  });

  test('criterion 3 — a legal placement is accepted', async ({ page }) => {
    await openLab(page);
    const before = await page.locator('.react-flow__node').count();
    // Verification Marker composes as a node, so open canvas is legal for it.
    await page.getByRole('button', { name: /^Verification Marker/ }).first().click();
    await expect(page.locator('.react-flow__node')).toHaveCount(before + 1);
    await expect(page.locator('output')).toHaveText('');
  });

  test('criterion 4 — an ordinary step may not silently grow a second branch', async ({ page }) => {
    test.skip(isMobile(page), 'port-to-port connection is a pointer interaction');
    await openLab(page);

    const step = page.locator('.react-flow__node').filter({ hasText: 'Step Node' }).first();
    const outcome = page.locator('.react-flow__node').filter({ hasText: 'Outcome Marker' }).first();

    // Step Node already leads to Decision Gate. A second outgoing edge from a
    // non-decision is exactly the branch the contract refuses to fabricate.
    const from = step.locator('.react-flow__handle.source');
    const to = outcome.locator('.react-flow__handle.target');
    const a = await from.boundingBox();
    const b = await to.boundingBox();
    if (!a || !b) throw new Error('handles not found');

    const edgesBefore = await page.locator('.react-flow__edge').count();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
    await page.mouse.up();

    await expect(page.locator('output')).toContainText('Only a Decision Gate may branch');
    await expect(page.locator('.react-flow__edge')).toHaveCount(edgesBefore);
  });

  test('criterion 1 — toggling projection preserves the selection', async ({ page }) => {
    test.skip(isMobile(page), 'there is no 3D projection on mobile, by design');
    await openLab(page);

    await page.locator('.react-flow__node').filter({ hasText: 'Decision Gate' }).first().click();
    await page.getByRole('button', { name: 'attention', exact: true }).click();

    const read = () => page.locator('dd').allTextContents();
    const before = await read();

    await page.getByRole('button', { name: '3D', exact: true }).click();
    await expect(page.locator('canvas')).toBeVisible();

    // Same record, same state, same link counts — one graph, two projections.
    expect(await read()).toEqual(before);
  });

  test('criterion 9 — mobile renders the 2D projection and never creates WebGL', async ({ page }) => {
    test.skip(!isMobile(page), 'this is the mobile guarantee specifically');
    await openLab(page);
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.getByRole('button', { name: '3D', exact: true })).toHaveCount(0);
    await expect(page.locator('.react-flow__node').first()).toBeVisible();
  });
});
