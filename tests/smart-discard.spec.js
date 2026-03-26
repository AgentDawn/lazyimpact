const { test, expect } = require('@playwright/test');

// Artifacts designed to be discard candidates (bad set + bad substats)
const JUNK_ARTIFACTS = [
  {
    name: 'Junk Flower', set_name: 'Lavawalker', slot: 'flower',
    level: 0, main_stat_type: 'hp', main_stat_value: '717',
  },
  {
    name: 'Junk Sands', set_name: 'Lavawalker', slot: 'sands',
    level: 0, main_stat_type: 'def_', main_stat_value: '58.3%',
  },
  {
    name: 'Junk Goblet', set_name: 'RetracingBolide', slot: 'goblet',
    level: 4, main_stat_type: 'def_', main_stat_value: '23.1%',
  },
];

// Artifacts that should NOT be flagged (good set + good stats)
const GOOD_ARTIFACTS = [
  {
    name: 'Good Flower', set_name: 'EmblemOfSeveredFate', slot: 'flower',
    level: 20, main_stat_type: 'hp', main_stat_value: '4780',
    sub1_name: 'critRate_', sub1_value: '10.5', sub1_rolls: 3,
    sub2_name: 'critDMG_', sub2_value: '21.0', sub2_rolls: 3,
    sub3_name: 'atk_', sub3_value: '5.8', sub3_rolls: 1,
    sub4_name: 'enerRech_', sub4_value: '6.5', sub4_rolls: 1,
  },
  {
    name: 'Good Sands', set_name: 'EmblemOfSeveredFate', slot: 'sands',
    level: 20, main_stat_type: 'enerRech_', main_stat_value: '51.8%',
    sub1_name: 'critRate_', sub1_value: '7.0', sub1_rolls: 2,
    sub2_name: 'critDMG_', sub2_value: '14.0', sub2_rolls: 2,
    sub3_name: 'atk_', sub3_value: '11.1', sub3_rolls: 2,
    sub4_name: 'hp_', sub4_value: '4.7', sub4_rolls: 1,
  },
];

// An equipped artifact (should always be excluded)
const EQUIPPED_ARTIFACT = {
  name: 'Equipped Circlet', set_name: 'Lavawalker', slot: 'circlet',
  level: 0, main_stat_type: 'def_', main_stat_value: '7.9%',
  equipped_by: 'Raiden Shogun',
};

test.describe('Smart Discard page', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('/api/register', { data: { username: 'pw_test_user', password: 'testpass1234' } });
    await page.request.post('/api/login', { data: { username: 'pw_test_user', password: 'testpass1234' } });

    for (const art of [...JUNK_ARTIFACTS, ...GOOD_ARTIFACTS, EQUIPPED_ARTIFACT]) {
      await page.request.post('/api/artifacts', { data: art });
    }
  });

  test('page loads with correct title', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Smart Discard/);
  });

  test('displays analysis summary', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    // Wait for loading to finish
    await page.waitForSelector('#sd-loading', { state: 'hidden', timeout: 10000 });

    const total = await page.locator('#sd-total').textContent();
    expect(Number(total)).toBeGreaterThanOrEqual(6);

    const analyzed = await page.locator('#sd-analyzed').textContent();
    expect(Number(analyzed)).toBeGreaterThan(0);
  });

  test('shows discard candidates', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#sd-loading', { state: 'hidden', timeout: 10000 });

    const candidates = await page.locator('#sd-candidates').textContent();
    expect(Number(candidates)).toBeGreaterThan(0);

    // Grid should be visible with cards
    await expect(page.locator('#sd-grid')).toBeVisible();
    const cards = page.locator('#sd-grid .artifact-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('discard candidates show reasons', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#sd-loading', { state: 'hidden', timeout: 10000 });
    await page.waitForSelector('.sd-reason', { timeout: 5000 });

    const reasons = page.locator('.sd-reason');
    const count = await reasons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('discard candidates show score badges', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#sd-loading', { state: 'hidden', timeout: 10000 });
    await page.waitForSelector('.sd-score-badge', { timeout: 5000 });

    const badges = page.locator('.sd-score-badge');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);

    // All scores should be < 30 (discard threshold)
    for (let i = 0; i < count; i++) {
      const text = await badges.nth(i).textContent();
      const score = parseInt(text.replace(/[^0-9-]/g, ''));
      expect(score).toBeLessThan(30);
    }
  });

  test('equipped artifacts are excluded from candidates', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#sd-loading', { state: 'hidden', timeout: 10000 });

    const gridText = await page.locator('#sd-grid').textContent();
    expect(gridText).not.toContain('Equipped Circlet');
  });

  test('good artifacts are excluded from candidates', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#sd-loading', { state: 'hidden', timeout: 10000 });

    const gridText = await page.locator('#sd-grid').textContent();
    expect(gridText).not.toContain('절연의 기치'); // EmblemOfSeveredFate Korean name
  });

  test('smart discard FAB button exists on artifacts page', async ({ page }) => {
    await page.goto('/artifacts.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.artifact-card', { timeout: 10000 });

    const fab = page.locator('a[href="smart-discard.html"]');
    await expect(fab).toBeVisible();
  });

  test('FAB navigates to smart discard page', async ({ page }) => {
    await page.goto('/artifacts.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.artifact-card', { timeout: 10000 });

    await page.click('a[href="smart-discard.html"]');
    await expect(page).toHaveURL(/smart-discard/);
    await expect(page).toHaveTitle(/Smart Discard/);
  });

  test('back link returns to artifacts page', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#sd-loading', { state: 'hidden', timeout: 10000 });

    await page.click('a[href="artifacts.html"]');
    await expect(page).toHaveURL(/artifacts/);
  });
});

test.describe('Smart Discard API', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/register', { data: { username: 'pw_test_user', password: 'testpass1234' } });
    await request.post('/api/login', { data: { username: 'pw_test_user', password: 'testpass1234' } });
  });

  test('GET /api/artifacts/smart-discard returns valid response', async ({ request }) => {
    // Seed some junk
    for (const art of JUNK_ARTIFACTS) {
      await request.post('/api/artifacts', { data: art });
    }

    const res = await request.get('/api/artifacts/smart-discard');
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data).toHaveProperty('candidates');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('analyzed');
    expect(Array.isArray(data.candidates)).toBeTruthy();
  });

  test('candidates have required fields', async ({ request }) => {
    for (const art of JUNK_ARTIFACTS) {
      await request.post('/api/artifacts', { data: art });
    }

    const res = await request.get('/api/artifacts/smart-discard');
    const data = await res.json();

    if (data.candidates.length > 0) {
      const c = data.candidates[0];
      expect(c).toHaveProperty('artifact');
      expect(c).toHaveProperty('score');
      expect(c).toHaveProperty('reasons');
      expect(typeof c.score).toBe('number');
      expect(Array.isArray(c.reasons)).toBeTruthy();
      expect(c.reasons.length).toBeGreaterThan(0);
    }
  });

  test('POST /api/artifacts/batch-delete works', async ({ request }) => {
    // Create a sacrificial artifact
    await request.post('/api/artifacts', { data: JUNK_ARTIFACTS[0] });

    const listRes = await request.get('/api/artifacts');
    const artifacts = await listRes.json();
    const targetId = artifacts[artifacts.length - 1].id;

    const delRes = await request.post('/api/artifacts/batch-delete', {
      data: { ids: [Number(targetId)] },
    });
    expect(delRes.ok()).toBeTruthy();

    const result = await delRes.json();
    expect(result.deleted).toBe(1);
  });

  test('batch-delete rejects empty ids', async ({ request }) => {
    const res = await request.post('/api/artifacts/batch-delete', {
      data: { ids: [] },
    });
    expect(res.ok()).toBeFalsy();
  });
});
