import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "no-undef": "error", // Catch undefined variables
      "no-unused-vars": "warn", // Warn about unused variables
      "prefer-const": "error", // Prefer const over let when possible
    },
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
];

export default eslintConfig;
