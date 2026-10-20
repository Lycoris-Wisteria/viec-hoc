import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

loadEnvConfig(process.cwd());

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const requiredTestVariables = ["TEST_EMAIL_A", "TEST_PASSWORD_A"] as const;
const missingTestVariables = requiredTestVariables.filter((name) => !process.env[name]);

if (missingTestVariables.length > 0) {
  console.warn(
    `Authenticated Playwright tests require these variables in .env.local: ${missingTestVariables.join(", ")}`,
  );
}

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/tasks.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command: "npm run dev -- --hostname localhost",
    url: `${baseURL}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
