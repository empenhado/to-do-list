import nextConfig from "eslint-config-next";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  nextConfig,
]);

export default eslintConfig;
