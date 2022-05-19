const packageJson = require("./package.json");
const devDependencies = Object.keys(packageJson.devDependencies || {});

module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:node/recommended", "plugin:prettier/recommended"],
  plugins: ["mocha"],
  rules: {
    "mocha/no-skipped-tests": "error",
    "mocha/no-exclusive-tests": "error",
    "node/no-unpublished-require": [
      "error",
      {
        allowModules: devDependencies,
      },
    ],
  },
  env: {
    node: true,
    es6: true,
    mocha: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
};
