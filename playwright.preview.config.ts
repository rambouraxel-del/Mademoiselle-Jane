import { defineConfig, devices } from "@playwright/test";

/**
 * Tests du mode aperçu visuel, contre un serveur lancé avec PREVIEW_MODE=true
 * (par défaut http://localhost:3200, voir docs/APERCU-VERCEL.md).
 */
process.env.E2E_PREVIEW = "1";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "preview.spec.ts",
  timeout: 60_000,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3200",
    locale: "fr-FR",
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [{ name: "apercu", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
});
