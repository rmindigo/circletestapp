import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // JUnit output feeds CircleCI test insights and timing-based test splitting
    reporters: ["default", ["junit", { addFileAttribute: true }]],
    outputFile: { junit: "reports/junit.xml" },
  },
});
