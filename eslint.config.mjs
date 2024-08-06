import perfectionist from "eslint-plugin-perfectionist";

export default {
  plugins: {
    perfectionist,
  },
  rules: {
    "@typescript-eslint/no-invalid-void-type": "off",
    "perfectionist/sort-imports": "error",
  },
};
