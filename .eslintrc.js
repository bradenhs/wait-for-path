module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": [
      "warn",
      {
        endOfLine: "auto",
      },
    ],
    curly: ["warn", "all"],
    camelcase: ["warn"],
    eqeqeq: ["warn"],
    "no-var": ["warn"],
    "@typescript-eslint/no-implicit-any-catch": ["warn"],
    "prefer-const": [
      "warn",
      {
        destructuring: "all",
        ignoreReadBeforeAssign: true,
      },
    ],
  },
};
