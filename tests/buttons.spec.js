const { test, expect } = require('@playwright/test');

let btnTestCounter = 0;

test.beforeEach(async ({ page }) => {
  const user = `btn_test_${Date.now()}_${btnTestCounter++}`;
  await page.request.post('/api/register', { data: { username: user, password: 'testpass1234' } });
  await page.request.post('/api/login', { data: { username: user, password: 'testpass1234' } });
});

test.describe('Characters page buttons', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test character since there is no seed data
    await page.request.post('/api/characters', {
      data: {
        name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm',
        level: 90, hp: 19445, atk: 2104, crit_rate: 64.2, crit_dmg: 148.5,
        energy_recharge: 274.1, elemental_mastery: 105,
        weapon_name: 'Engulfing Lightning',
      },
    });
  });

  test('Run Optimizer button is clickable', async ({ page }) => {
    await page.goto('/characters.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#btn-optimize');
    await page.click('#btn-optimize');
    // Should not throw
  });

  test('range sliders respond to input', async ({ page }) => {
    await page.goto('/characters.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#range-er');
    await page.locator('#range-er').fill('200');
    await page.locator('#range-er').dispatchEvent('input');
    await expect(page.locator('.range-header__value').first()).toHaveText('200%');
  });

  test('weapon swap button is clickable', async ({ page }) => {
    await page.goto('/characters.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.weapon-slot__swap');
    await page.click('.weapon-slot__swap');
  });
});

test.describe('Artifacts page buttons', () => {
  test.beforeEach(async ({ page }) => {
    // Create test artifacts since there is no seed data
    await page.request.post('/api/artifacts', {
      data: {
        name: 'Test Flower', set_name: 'Gladiators Finale', slot: 'Flower',
        level: 20, main_stat_type: 'HP', main_stat_value: '4780',
      },
    });
    await page.request.post('/api/artifacts', {
      data: {
        name: 'Test Plume', set_name: 'Gladiators Finale', slot: 'Plume',
        level: 20, main_stat_type: 'ATK', main_stat_value: '311',
      },
    });
  });

  test('Delete artifact button works', async ({ page }) => {
    await page.goto('/artifacts.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.artifact-card', { timeout: 15000 });
    const countBefore = await page.locator('.artifact-card').count();
    await page.locator('.artifact-card__edit').first().click();
    await page.waitForTimeout(500);
    const countAfter = await page.locator('.artifact-card').count();
    expect(countAfter).toBe(countBefore - 1);
  });

  test('Filter slot buttons are clickable', async ({ page }) => {
    await page.goto('/artifacts.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.artifact-card', { timeout: 15000 });
    const slot = page.locator('.filter-slot').nth(0);
    await slot.click();
    await expect(slot).toHaveClass(/filter-slot--active/);
  });

  test('Sort tabs switch', async ({ page }) => {
    await page.goto('/artifacts.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.artifact-card', { timeout: 15000 });
    await page.locator('.sort-tab').nth(1).click();
    await expect(page.locator('.sort-tab').nth(1)).toHaveClass(/sort-tab--active/);
  });

  test('FAB button is clickable', async ({ page }) => {
    await page.goto('/artifacts.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.fab');
    await page.click('.fab');
  });
});

test.describe('Weapons page buttons', () => {
  test('Add Weapon button opens modal', async ({ page }) => {
    await page.goto('/weapons.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#weapon-grid');
    await page.waitForTimeout(500);
    const addBtn = page.locator('.artifact-add');
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await expect(page.locator('.modal-backdrop.is-open')).toBeVisible();
    await expect(page.locator('.modal__title')).toHaveText('무기 추가');
  });
});

test.describe('Teams page buttons', () => {
  test('Create Team button opens modal', async ({ page }) => {
    await page.goto('/teams.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#team-list');
    await page.waitForTimeout(500);
    const addBtn = page.locator('.artifact-add');
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await expect(page.locator('.modal-backdrop.is-open')).toBeVisible();
    await expect(page.locator('.modal__title')).toHaveText('새 팀 만들기');
  });
});

test.describe('Builds page buttons', () => {
  test('Save Build button opens modal', async ({ page }) => {
    await page.goto('/builds.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#build-list');
    await page.waitForTimeout(500);
    const addBtn = page.locator('.artifact-add');
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await expect(page.locator('.modal-backdrop.is-open')).toBeVisible();
    await expect(page.locator('.modal__title')).toHaveText('현재 빌드 저장');
  });
});

test.describe('Auth page buttons', () => {
  test('toggle between login/register works', async ({ browser }) => {
    // Use fresh context without session cookie
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle' });
    await expect(page.locator('#auth-submit')).toHaveText('로그인');
    await page.click('#auth-toggle');
    await expect(page.locator('#auth-submit')).toHaveText('계정 만들기');
    await page.click('#auth-toggle');
    await expect(page.locator('#auth-submit')).toHaveText('로그인');
    await ctx.close();
  });
});

test.describe('Navigation buttons', () => {
  test('logout button works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#btn-logout');
    await page.click('#btn-logout');
    await page.waitForURL(/login/);
  });

  test('all nav links are clickable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.nav__link');
    const links = page.locator('.nav__link');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < count; i++) {
      await expect(links.nth(i)).toBeEnabled();
    }
  });
});
