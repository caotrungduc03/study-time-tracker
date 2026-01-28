import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Project-specific ignores
    "node_modules/**",
    "dist/**",
    "coverage/**",
    "public/**",
    "yarn-error.log*",
    "npm-debug.log*",
  ]),
  // Project-specific lint rules
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // discourage using console.log in production code
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // prefer const when variables are never reassigned
      "prefer-const": "error",
      // require === and !==
      eqeqeq: ["error", "always"],
      // require braces for all control statements with multiple lines
      curly: ["error", "multi-line"],
      // always require semicolons
      semi: ["error", "always"],
      // TypeScript-specific rules (typescript plugin is included via nextTs)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      // sort imports/exports (requires eslint-plugin-simple-import-sort)
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
    // enable detection of react version for any react-specific rules
    settings: {
      react: { version: "detect" },
    },
    // report when eslint-disable comments are unused (flat config linter option)
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
]);

export default eslintConfig;
