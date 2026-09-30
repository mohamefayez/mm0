import { defineConfig } from "@playwright/test";
import path from "node:path";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3002";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  use: {
    baseURL,
    channel: "chrome",
    headless: true,
    actionTimeout: 15_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  reporter: "list",
  webServer: {
    command: `node --experimental-strip-types scripts/prepare-e2e.mjs && npm.cmd run start -- --port ${new URL(baseURL).port || "3002"}`,
    env: { ASEL_DATA_DIR: path.resolve(".local/e2e-data") },
    url: `${baseURL}/en`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
