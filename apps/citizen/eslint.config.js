/* eslint-env node */
import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat";

export default defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      "react/display-name": "off",
    },
  },
]);
