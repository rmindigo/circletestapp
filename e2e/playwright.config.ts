import { defineConfig, devices } from "@playwright/test";

const CI = !!process.env.CI;

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  outputDir: "reports/artifacts",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: [
    ["list"],
    // JUnit feeds CircleCI test insights; HTML report is stored as a CI artifact
    ["junit", { outputFile: "reports/junit.xml" }],
    ["html", { outputFolder: "reports/html", open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      // channel "chromium" runs full Chromium in new headless mode rather than
      // the stripped-down headless shell, so it matches a real browser
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
    },
  ],
  // Run the production builds of both apps, the same artifacts CI ships
  webServer: [
    {
      command: "npm run build -w services/api && npm start -w services/api",
      cwd: "..",
      url: "http://localhost:3000/health",
      reuseExistingServer: !CI,
    },
    {
      command: "npm run build -w apps/web && npm run preview -w apps/web -- --port 4173 --strictPort",
      cwd: "..",
      url: "http://localhost:4173",
      reuseExistingServer: !CI,
    },
  ],
});
