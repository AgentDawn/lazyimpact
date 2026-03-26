const { test, expect } = require('@playwright/test');

// Helper: register + login via API and return cookie context
async function loginAs(page, username, password) {
  // Register (ignore if already exists)
  await page.request.post('/api/register', {
    data: { username, password },
  });
  const res = await page.request.post('/api/login', {
    data: { username, password },
  });
  expect(res.ok()).toBeTruthy();
}

test.describe('Auth flow', () => {
  const user = `testuser_${Date.now()}`;
  const pass = 'securepass123';

  test('unauthenticated user is redirected to login page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // app.js should redirect to login
    await page.waitForURL(/login/);
    await expect(page).toHaveURL(/login/);
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login.html', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('LazyImpact');
    await expect(page.locator('#auth-submit')).toHaveText('로그인');
    await expect(page.locator('#auth-toggle')).toHaveText('회원가입');
  });

  test('can toggle between login and register modes', async ({ page }) => {
    await page.goto('/login.html', { waitUntil: 'networkidle' });
    await expect(page.locator('#auth-submit')).toHaveText('로그인');
    // Security notice hidden in login mode
    await expect(page.locator('#security-notice')).toBeHidden();
    await page.click('#auth-toggle');
    await expect(page.locator('#auth-submit')).toHaveText('계정 만들기');
    await expect(page.locator('#auth-toggle')).toHaveText('로그인');
    // Security notice visible in register mode
    await expect(page.locator('#security-notice')).toBeVisible();
    await expect(page.locator('#security-notice')).toContainText('bcrypt');
    await page.click('#auth-toggle');
    await expect(page.locator('#auth-submit')).toHaveText('로그인');
    // Security notice hidden again
    await expect(page.locator('#security-notice')).toBeHidden();
  });

  test('register and login flow works end-to-end', async ({ page }) => {
    await page.goto('/login.html', { waitUntil: 'networkidle' });
    await expect(page.locator('#auth-submit')).toHaveText('로그인');
    // Switch to register
    await page.click('#auth-toggle');
    await page.fill('#auth-username', user);
    await page.fill('#auth-password', pass);
    await page.click('#auth-submit');

    // Should redirect to home after register+auto-login
    await page.waitForURL(url => !url.toString().includes('login'), { timeout: 10000 });
    await expect(page).toHaveURL(/index|\/$/);
  });

  test('logged-in user sees username and logout button', async ({ page }) => {
    await loginAs(page, user, pass);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#btn-logout', { timeout: 10000 });
    await expect(page.locator('#btn-logout')).toBeVisible();
    await expect(page.locator('.nav__actions')).toContainText(user);
  });

  test('protected API returns data when authenticated', async ({ page }) => {
    await loginAs(page, user, pass);
    const res = await page.request.get('/api/characters');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    // No seed data; new user starts with empty character list
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('logout redirects to login page', async ({ page }) => {
    await loginAs(page, user, pass);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#btn-logout', { timeout: 10000 });
    await page.click('#btn-logout');
    await page.waitForURL(/login/);
    await expect(page).toHaveURL(/login/);
  });

  test('wrong password shows error', async ({ page }) => {
    await page.goto('/login.html', { waitUntil: 'networkidle' });
    await expect(page.locator('#auth-submit')).toHaveText('로그인');
    await page.fill('#auth-username', user);
    await page.fill('#auth-password', 'wrongpassword');
    await page.click('#auth-submit');
    await expect(page.locator('#auth-error')).toBeVisible();
    await expect(page.locator('#auth-error')).toContainText('invalid credentials');
  });

  test('short password rejected on register', async ({ page }) => {
    await page.goto('/login.html', { waitUntil: 'networkidle' });
    await expect(page.locator('#auth-submit')).toHaveText('로그인');
    await page.click('#auth-toggle');
    await page.fill('#auth-username', 'short_pw_user');
    await page.fill('#auth-password', '123');
    await page.click('#auth-submit');
    await expect(page.locator('#auth-error')).toBeVisible();
    await expect(page.locator('#auth-error')).toContainText('at least 8');
  });

  test('duplicate username rejected', async ({ page }) => {
    await page.goto('/login.html', { waitUntil: 'networkidle' });
    await expect(page.locator('#auth-submit')).toHaveText('로그인');
    await page.click('#auth-toggle');
    await page.fill('#auth-username', user);
    await page.fill('#auth-password', 'anotherpass123');
    await page.click('#auth-submit');
    await expect(page.locator('#auth-error')).toBeVisible();
    await expect(page.locator('#auth-error')).toContainText('already taken');
  });
});
