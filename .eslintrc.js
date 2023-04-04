module.exports = {
  env: {
    es2022: true,
    node: true,
  },
  extends: [
    "standard",
    "plugin:@typescript-eslint/recommended",
    "plugin:typescript-sort-keys/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "simple-import-sort",
    "typescript-sort-keys",
    "unused-imports",
  ],
  root: true,
  overrides: [
    {
      files: ["*.ts"],
      rules: { "@typescript-eslint/explicit-function-return-type": "warn" },
    },
  ],
  rules: {
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/no-unused-vars": "error",
    indent: ["error", 2, { ignoredNodes: ["PropertyDefinition"] }],
    "arrow-body-style": "off",
    "comma-dangle": ["error", "always-multiline"],
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    // "max-len": ["error", { code: 100 }],
    "no-useless-constructor": "off",
    "simple-import-sort/exports": "error",
    "simple-import-sort/imports": "error",
    "space-before-function-paren": ["error", "always"],
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": "error",
    camelcase: "off",
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "key-spacing": ["error", {
      singleLine: {
        beforeColon: false,
        afterColon: true,
      },
    }],
  },
};
