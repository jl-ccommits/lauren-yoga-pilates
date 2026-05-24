import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 5_000 },
  workers: 2,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:8125',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 8125 --directory www',
    url: 'http://127.0.0.1:8125',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'iphone-safari-size',
      use: {
        ...devices['iPhone 14'],
        browserName: 'chromium',
      },
    },
  ],
});
