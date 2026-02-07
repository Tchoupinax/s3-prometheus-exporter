import eslintPluginJsonc from "eslint-plugin-jsonc";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      "**/node_modules/**",
      "**/build/**",
      "**/examples/**",
      "**/tests/**",
      "**/scripts/**",
      "**/eslint.config.mjs",
    ],
  },
  ...eslintPluginJsonc.configs["flat/recommended-with-jsonc"],
  {
    files: ["**/*.ts", "**/*.mts"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        // This is a modern feature that start a typescript server to analyze the code and eslint discusses with this server
        // It improves a lot the efficiency of the lint analysis but it can be very long if the file is complex
        // to parse by typescript.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "eslint-plugin-prettier": eslintPluginPrettierRecommended,
      "simple-import-sort": simpleImportSort,
      "@typescript-eslint/no-explicit-any": {},
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      ignores: ["package.json"],
      rules: {
        // https://github.com/lydell/eslint-plugin-simple-import-sort
        "simple-import-sort/imports": [
          "error",
          {
            // https://dev.to/receter/automatic-import-sorting-in-vscode-275m
            groups: [["^node", "^@?\\w"], ["^#.*"], ["^[^@]?\\w"]],
          },
        ],
        "simple-import-sort/exports": "error",
      },
    },
  },
  {
    files: ["**/*.json"],
    ignores: ["package.json"],
    rules: {
      "jsonc/sort-keys": ["error"],
    },
  },
);
