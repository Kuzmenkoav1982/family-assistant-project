import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('root route does not crash and renders visible content', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response, 'no HTTP response for /').not.toBeNull();
    expect(response!.status(), 'root must respond with success status').toBeLessThan(400);

    const root = page.locator('#root');
    await expect(root).toBeVisible();
    await expect(root).not.toBeEmpty();

    expect(pageErrors, `unexpected page errors: ${pageErrors.map((e) => e.message).join(' | ')}`).toEqual([]);
  });

  test('invalid route does not break the app', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.goto('/__definitely_not_exists__', { waitUntil: 'domcontentloaded' });

    const root = page.locator('#root');
    await expect(root).toBeVisible();
    await expect(root).not.toBeEmpty();

    expect(pageErrors, `unexpected page errors: ${pageErrors.map((e) => e.message).join(' | ')}`).toEqual([]);
  });
});
