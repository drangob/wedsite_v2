import { mergeConfig } from "vitest/config";
import baseConfig from "../../vitest.config.base";

export default mergeConfig(baseConfig, {
  test: {
    name: "app",
    environment: "jsdom",
    include: ["**/*.{test,spec}.{ts,tsx}"],
  },
});
