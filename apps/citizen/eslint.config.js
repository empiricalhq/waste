// biome-ignore-all lint/style/noCommonJs: Expo provides this config as CommonJS.

const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // These rules conflict with Reanimated's SharedValue API and the current fetch-on-mount effect.
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
