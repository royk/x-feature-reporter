import { defineConfig, devices } from '@playwright/test';

const isWatch = process.env.PWTEST_WATCH === '1';
export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  // @ts-ignore
  reporter: process.env.CI ? [['github'],
                              ['html'],
                              ['playwright-feature-reporter', { outputFile: './README.md', fullReportLink: 'https://raw.githack.com/royk/x-feature-reporter/refs/heads/main/playwright-report/index.html' }]] 
                              : 'list',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'no-browser'
    }

  ]
});
