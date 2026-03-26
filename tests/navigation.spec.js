const { test, expect } = require('@playwright/test');

// Login before each test in this file
test.beforeEach(async ({ page }) => {
  await page.request.post('/api/register', { data: { username: 'pw_test_user', password: 'testpass1234' } });
  await page.request.post('/api/login', { data: { username: 'pw_test_user', password: 'testpass1234' } });
});

const PAGES = [
  { name: 'Home', path: '/', title: 'Home' },
  { name: 'Characters', path: '/characters.html', title: 'Character Build' },
  { name: 'Artifacts', path: '/artifacts.html', title: 'Artifacts Inventory' },
  { name: 'Weapons', path: '/weapons.html', title: 'Weapons' },
  { name: 'Teams', path: '/teams.html', title: 'Teams' },
  { name: 'Theater', path: '/theater.html', title: 'Theater' },
  { name: 'Planner', path: '/planner.html', title: 'Planner' },
  { name: 'Scanner', path: '/scanner.html', title: 'Scanner' },
];

test.describe('Page loading', () => {
  for (const page of PAGES) {
    test(`${page.name} page loads with correct title`, async ({ page: p }) => {
      await p.goto(page.path, { waitUntil: 'domcontentloaded' });
      await expect(p).toHaveTitle(new RegExp(page.title));
    });
  }
});

test.describe('Navigation', () => {
  test('nav bar is present on all pages', async ({ page }) => {
    for (const p of PAGES) {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.nav')).toBeVisible();
      await expect(page.locator('.nav__brand')).toHaveText('LazyImpact');
    }
  });

  test('nav links navigate between pages', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.click('a.nav__link[href="characters.html"]');
    await expect(page).toHaveURL(/characters/);

    await page.click('a.nav__link[href="artifacts.html"]');
    await expect(page).toHaveURL(/artifacts/);

    await page.click('a.nav__link[href="weapons.html"]');
    await expect(page).toHaveURL(/weapons/);

    await page.click('a.nav__link[href="teams.html"]');
    await expect(page).toHaveURL(/teams/);

    await page.click('a.nav__link[href="theater.html"]');
    await expect(page).toHaveURL(/theater/);

    await page.click('a.nav__link[href="planner.html"]');
    await expect(page).toHaveURL(/planner/);

    await page.click('a.nav__link[href="scanner.html"]');
    await expect(page).toHaveURL(/scanner/);

    await page.click('a.nav__link[href="index.html"]');
    await expect(page).toHaveURL(/index|\/$/);
  });

  test('brand logo links to home', async ({ page }) => {
    await page.goto('/characters.html', { waitUntil: 'domcontentloaded' });
    await page.click('.nav__brand');
    await expect(page).toHaveURL(/index|\/$/);
  });

  test('active nav link is highlighted on each page', async ({ page }) => {
    await page.goto('/artifacts.html', { waitUntil: 'domcontentloaded' });
    // JS sets active class dynamically
    await page.waitForSelector('.nav__link--active');
    const activeLink = page.locator('.nav__link--active');
    await expect(activeLink).toHaveAttribute('href', 'artifacts.html');
  });
});

test.describe('Footer', () => {
  test('footer is present on all pages', async ({ page }) => {
    for (const p of PAGES) {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.footer')).toBeVisible();
      await expect(page.locator('.footer__copy')).toContainText('HoYoverse');
    }
  });
});

test.describe('Home page - API integration', () => {
  test('loads counts from API', async ({ page }) => {
    // Create a test character since there is no seed data
    await page.request.post('/api/characters', {
      data: {
        name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm',
        level: 90, hp: 19445, atk: 2104, crit_rate: 64.2, crit_dmg: 148.5,
        energy_recharge: 274.1, elemental_mastery: 105,
      },
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#home-char-avatars img');
    // At least 1 character avatar (shared user may have more from other tests)
    const avatars = page.locator('#home-char-avatars img');
    const count = await avatars.count();
    expect(count).toBeGreaterThanOrEqual(1);
    // Artifact count
    await expect(page.locator('#home-artifact-count')).not.toHaveText('—');
  });
});
