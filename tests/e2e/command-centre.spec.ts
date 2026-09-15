import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Command Centre opens from keyboard, filters and navigates', async ({
  page,
}) => {
  await page.goto('/approvals');
  await page.getByRole('button', { name: 'Open Command Centre' }).waitFor();
  await page.waitForTimeout(750);
  await page.keyboard.press(
    process.platform === 'darwin' ? 'Meta+k' : 'Control+k',
  );
  const dialog = page.getByRole('dialog', { name: 'Command Centre' });
  await expect(dialog).toBeVisible();
  await dialog
    .getByPlaceholder('Search pages, records and actions…')
    .fill('approval');
  await dialog.getByText('Review decisions waiting for me').click();
  await expect(page).toHaveURL(/\/approvals$/);
});

test('Command Centre has no automatically detectable accessibility violations', async ({
  page,
}) => {
  await page.goto('/approvals');
  await page.waitForTimeout(750);
  await page
    .getByRole('button', { name: 'Open Command Centre' })
    .click({ force: true });
  await expect(
    page.getByRole('dialog', { name: 'Command Centre' }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page })
    .include('.command-dialog')
    .analyze();
  expect(results.violations).toEqual([]);
});

test('human authority journey resolves a decision with an operation result', async ({
  page,
}) => {
  await page.goto('/approvals');
  await page.waitForTimeout(750);
  const first = page.locator('.approval-card').first();
  await first.getByRole('button', { name: 'Approve' }).click({ force: true });
  await expect(first.getByText('Approved')).toBeVisible();
});

test('shell remains bounded at supported breakpoints', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.rail')).toBeVisible();
  await expect(page.locator('.mirror')).toHaveCSS(
    'height',
    `${await page.evaluate(() => innerHeight)}px`,
  );
  await expect(page).toHaveScreenshot('company-shell.png', {
    fullPage: false,
    animations: 'disabled',
    mask: [page.locator('canvas')],
  });
});
