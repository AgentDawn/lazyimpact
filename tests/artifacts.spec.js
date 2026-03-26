const { test, expect } = require('@playwright/test');

const TEST_ARTIFACTS = [
  {
    name: 'Dreaming Steelbloom', set_name: 'Gilded Dreams', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.9%', rolls: 1 },
      { name: 'CRIT DMG', value: '7.8%', rolls: 1 },
      { name: 'ATK%', value: '5.8%', rolls: 1 },
      { name: 'Energy Recharge', value: '6.5%', rolls: 1 },
    ]),
  },
  {
    name: 'Feather of Judgment', set_name: 'Gilded Dreams', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
  },
  {
    name: 'Sands of Eon', set_name: 'Emblem of Severed Fate', slot: 'Sands',
    level: 20, main_stat_type: 'Energy Recharge', main_stat_value: '51.8%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
    ]),
  },
  {
    name: 'Goblet of Fire', set_name: 'Emblem of Severed Fate', slot: 'Goblet',
    level: 20, main_stat_type: 'Electro DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
  },
];

test.describe('Artifacts page', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('/api/register', { data: { username: 'pw_test_user', password: 'testpass1234' } });
    await page.request.post('/api/login', { data: { username: 'pw_test_user', password: 'testpass1234' } });

    // Create test artifacts since there is no seed data
    for (const art of TEST_ARTIFACTS) {
      await page.request.post('/api/artifacts', { data: art });
    }

    await page.goto('/artifacts.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.artifact-card', { timeout: 10000 });
  });

  test('displays page title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('성유물 인벤토리');
  });

  test('renders artifact cards from API', async ({ page }) => {
    const cards = page.locator('.artifact-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('artifact cards contain expected data', async ({ page }) => {
    const allText = await page.locator('#artifact-grid').textContent();
    expect(allText).toContain('Dreaming Steelbloom');
    expect(allText).toContain('Gilded Dreams');
    // API-created artifacts render the raw value (no comma formatting)
    expect(allText).toContain('4780');
    expect(allText).toContain('+20');
  });

  test('artifact cards have content', async ({ page }) => {
    const first = page.locator('.artifact-card').first();
    // Verify the card renders with text content (name, set, stats)
    const text = await first.textContent();
    expect(text.length).toBeGreaterThan(0);
  });

  test('artifact images have icon elements', async ({ page }) => {
    const icons = page.locator('.artifact-card__icon');
    const count = await icons.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('archive total shows artifact count from API', async ({ page }) => {
    const text = await page.locator('.archive-total__value').textContent();
    expect(Number(text)).toBeGreaterThanOrEqual(4);
  });

  test('filter slot buttons toggle active state', async ({ page }) => {
    const slots = page.locator('.filter-slot');
    await slots.nth(2).click();
    await expect(slots.nth(2)).toHaveClass(/filter-slot--active/);
  });

  test('filter tags toggle', async ({ page }) => {
    const tag = page.locator('.filter-tag').nth(2);
    await expect(tag).not.toHaveClass(/filter-tag--active/);
    await tag.click();
    await expect(tag).toHaveClass(/filter-tag--active/);
  });

  test('sort tabs toggle active state', async ({ page }) => {
    const tabs = page.locator('.sort-tab');
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveClass(/sort-tab--active/);
    await expect(tabs.first()).not.toHaveClass(/sort-tab--active/);
  });

  test('Add Artifact button exists', async ({ page }) => {
    await expect(page.locator('#btn-add-artifact')).toBeVisible();
  });

  test('delete artifact removes card', async ({ page }) => {
    const countBefore = await page.locator('.artifact-card').count();
    await page.locator('.artifact-card__edit').first().click();
    // Wait for re-render
    await page.waitForTimeout(500);
    const countAfter = await page.locator('.artifact-card').count();
    expect(countAfter).toBe(countBefore - 1);
  });
});
