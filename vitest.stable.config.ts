import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      setupFiles: ["./tests/setup/stableTestEnvironment.ts"],
      environment: "jsdom",
      isolate: true,
      fileParallelism: false,
      pool: "forks",
      hookTimeout: 15000,
      testTimeout: 20000,
      teardownTimeout: 10000,
      restoreMocks: true,
      clearMocks: true,
      mockReset: false,
      retry: process.env.CI ? 1 : 0,
      reporters: process.env.CI ? ["default", "junit"] : ["default"],
      outputFile: process.env.CI
        ? {
            junit: "./.test-results/vitest-junit.xml",
          }
        : undefined,
      coverage: {
        provider: "v8",
        reportsDirectory: "./coverage",
        reporter: ["text", "json-summary", "html"],
      },
    },
  }),
);
