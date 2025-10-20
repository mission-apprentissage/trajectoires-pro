import { defineConfig } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import mocha from "eslint-plugin-mocha";
import _import from "eslint-plugin-import";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:node/recommended-module",
        "plugin:prettier/recommended",
        "plugin:import/recommended"
      )
    ),

    plugins: {
      mocha,
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
      ecmaVersion: "latest", // Updated
      sourceType: "module",
    },

    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".json", ".node"],
        },
        "eslint-import-resolver-custom-alias": {
          alias: {
            "#src": "./src",
            "#tests": "./tests",
          },
          extensions: [".js", ".jsx"],
        },
      },
      "import/ignore": [
        // Added
        "node_modules",
        "\\.(coffee|scss|css|less|hbs|svg|json)$",
      ],
    },

    rules: {
      "mocha/no-exclusive-tests": "error",
      "node/no-missing-import": 0,
      "import/no-named-as-default": 0,
    },
  },
  {
    files: ["tests/**/*.js"],
    rules: {
      "node/no-unpublished-require": 0,
      "node/no-unpublished-import": 0,
      "import/namespace": 0,
      "import/no-unresolved": 0,
    },
  },
  {
    // CommonJS files
    files: ["tests/**/*.cjs"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
      sourceType: "commonjs",
    },
    rules: {
      "node/no-unpublished-require": 0,
      "import/no-commonjs": 0,
      "node/no-unsupported-features/es-syntax": [
        "error",
        {
          ignores: ["dynamicImport"],
        },
      ],
      "node/no-unpublished-import": "off",
    },
  },
]);
