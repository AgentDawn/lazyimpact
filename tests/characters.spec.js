const { test, expect } = require('@playwright/test');

let charTestCounter = 0;

test.describe('Characters page', () => {
  test.beforeEach(async ({ page }) => {
    // Use unique user to avoid stale data from previous runs
    const user = `char_test_${Date.now()}_${charTestCounter++}`;
    await page.request.post('/api/register', { data: { username: user, password: 'testpass1234' } });
    await page.request.post('/api/login', { data: { username: user, password: 'testpass1234' } });

    // Create test character using PascalCase key (GOOD format) for localization
    await page.request.post('/api/characters', {
      data: {
        name: 'RaidenShogun', element: 'Electro',
        weapon_type: 'Polearm', level: 90, weapon_name: 'Engulfing Lightning',
        hp: 19445, atk: 2104, crit_rate: 64.2, crit_dmg: 148.5,
        energy_recharge: 274.1, elemental_mastery: 105,
      },
    });

    await page.goto('/characters.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.character-name');
  });

  test('displays character name and subtitle from API', async ({ page }) => {
    await expect(page.locator('.character-name')).toHaveText('라이덴 쇼군');
    await expect(page.locator('.character-subtitle')).toContainText('번개');
  });

  test('displays character portrait', async ({ page }) => {
    const portrait = page.locator('.character-portrait img');
    await expect(portrait).toBeVisible();
    // alt is set via localizeCharName which translates PascalCase key to Korean
    await expect(portrait).toHaveAttribute('alt', /라이덴 쇼군/);
  });

  test('displays weapon name from API', async ({ page }) => {
    await expect(page.locator('.weapon-slot__name')).toHaveText('예초의 번개');
  });

  test('displays stats from API data', async ({ page }) => {
    const stats = page.locator('.stat__value');
    await expect(stats).toHaveCount(6);
    // HP from API: 19445
    await expect(stats.nth(0)).toContainText('19,445');
    // ATK from API: 2104
    await expect(stats.nth(1)).toContainText('2,104');
  });

  test('range sliders update displayed value', async ({ page }) => {
    const erSlider = page.locator('#range-er');
    const erValue = page.locator('.range-header__value').first();

    await erSlider.fill('300');
    await erSlider.dispatchEvent('input');
    await expect(erValue).toHaveText('300%');
  });

  test('Run Optimizer button is present', async ({ page }) => {
    await expect(page.locator('#btn-optimize')).toBeVisible();
  });

  test('results section exists in DOM', async ({ page }) => {
    await expect(page.locator('#results-list')).toHaveCount(1);
  });
});
