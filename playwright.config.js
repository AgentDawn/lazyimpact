const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    actionTimeout: 5000,
  },
  // Expects docker compose up -d already running on :3000
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
