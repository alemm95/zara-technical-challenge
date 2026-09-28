import { defineConfig, devices } from "@playwright/test";

const port = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  use: { baseURL: `http://localhost:${port}` },
  webServer: {
    command: process.env.CI
      ? `npm run start -- --port ${port}`
      : `npm run build && npm run start -- --port ${port}`,
    url: `http://localhost:${port}/cart`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
