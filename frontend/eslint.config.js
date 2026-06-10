import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import tseslint from "@typescript-eslint/parser";
import pluginQuasar from "@quasar/app-vite/eslint";
import {defineConfigWithVueTs, vueTsConfigs,} from "@vue/eslint-config-typescript";

const rules = {
  // '@typescript-eslint/consistent-type-imports': [
  //   'error',
  //   { prefer: 'type-imports' }
  // ],

  "object-curly-spacing": ["error", "always"],
  // allow async-await
  "generator-star-spacing": "off",
  // allow paren-less arrow functions
  "arrow-parens": "error",
  "one-var": "off",
  "no-void": "off",
  "multiline-ternary": "off",
  "space-before-function-paren": [
    "error",
    {
      anonymous: "always",
      named: "always",
      asyncArrow: "always",
    },
  ],
  "comma-dangle": ["error", "never"],

  "indent": ["error", 2, {
      SwitchCase: 1,
      ignoredNodes: ["TemplateLiteral *"],
      flatTernaryExpressions: false,
      offsetTernaryExpressions: true
  }],


  "import/extensions": "off",
  "import/no-unresolved": "off",
  "import/no-extraneous-dependencies": "off",

  // The core 'import/named' rules
  // does not work with type definitions
  "import/named": "off",

  // The core 'no-unused-vars' rules (in the eslint:recommended ruleset)
  // does not work with type definitions
  "no-unused-vars": "off",
  "prefer-promise-reject-errors": "off",

  quotes: ["error", "single", { avoidEscape: true }],
  semi: ["error", "never"],

  "no-undef": "off",
  "@typescript-eslint/no-undef": "off",


  // allow debugger during development only
  // eslint-disable-next-line no-undef
  "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  // 'no-console': [
  //   'warn',
  //   { allow: ['clear', 'info', 'error', 'dir', 'trace', 'groupEnd', 'groupCollapsed'] }
  // ]
};

export default defineConfigWithVueTs(
  {
    /**
     * Ignore the following files.
     * Please note that pluginQuasar.configs.recommended() already ignores
     * the "node_modules" folder for you (and all other Quasar project
     * relevant folders and files).
     *
     * ESLint requires "ignores" key to be the only one in this object
     */
    ignores: [
      'src/assets/jalali-moment.browser.js'
    ]
  },

  pluginQuasar.configs.recommended(),
  js.configs.recommended,

  /**
   * https://eslint.vuejs.org
   *
   * pluginVue.configs.base
   *   -> Settings and rules to enable correct ESLint parsing.
   * pluginVue.configs[ 'flat/essential']
   *   -> base, plus rules to prevent errors or unintended behavior.
   * pluginVue.configs["flat/strongly-recommended"]
   *   -> Above, plus rules to considerably improve code readability and/or dev experience.
   * pluginVue.configs["flat/recommended"]
   *   -> Above, plus rules to enforce subjective community defaults to ensure consistency.
   */
  pluginVue.configs["flat/essential"],

  // ToDo: enable this
  // https://github.com/vuejs/eslint-config-typescript
  // vueTsConfigs.recommendedTypeChecked,

  vueTsConfigs.disableTypeChecked,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        process: "readonly",
        ga: "readonly",
        cordova: "readonly",
        Capacitor: "readonly",
        chrome: "readonly",
        browser: "readonly",
      },
    },
    rules,
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: tseslint,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        process: "readonly",
        ga: "readonly",
        cordova: "readonly",
        Capacitor: "readonly",
        chrome: "readonly",
        browser: "readonly",
      },
    },
    rules: {
      ...rules,

      // in plain CommonJS modules, you can't use `import foo = require('foo')` to pass this rule, so it has to be disabled
      "vue/multi-word-component-names": "off",
      "vue/order-in-components": "error",
      "vue/max-attributes-per-line": "error",
      "vue/html-closing-bracket-spacing": "error",
      "vue/no-multi-spaces": "error",
      "vue/component-name-in-template-casing": [
        "error",
        "kebab-case",
        {
          ignores: [],
        },
      ],
      "vue/html-closing-bracket-newline": [
        "error",
        {
          singleline: "never",
          multiline: "never",
        },
      ],
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "never",
            normal: "always",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],
      "vue/first-attribute-linebreak": [
        "error",
        {
          singleline: "beside",
          multiline: "below",
        },
      ],
      "vue/valid-v-slot": [
        "error",
        {
          allowModifiers: true,
        },
      ],
      "vue/html-indent": ["error", 2, {
        attribute: 1,
        baseIndent: 1,
        closeBracket: 0,
        alignAttributesVertically: true,
        ignores: []
      }],
      "vue/attributes-order": "error",
    },
  },
  {
    files: ["src-pwa/custom-service-worker.ts"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
    },
  },
);
