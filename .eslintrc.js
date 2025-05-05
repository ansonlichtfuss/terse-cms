module.exports = {
  extends: ["next/core-web-vitals", "eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  rules: {
    // Enforce maximum file length of 250 lines
    "max-lines": [
      "error",
      {
        max: 250,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    // Other rules can be added here
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
}
