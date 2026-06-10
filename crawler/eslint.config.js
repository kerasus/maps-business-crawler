const js = require("@eslint/js");

module.exports = [
    js.configs.recommended,

    {
        files: ["**/*.js"],

        languageOptions: {
            ecmaVersion: 2023,
            sourceType: "commonjs",

            globals: {
                console: "readonly",
                __dirname: "readonly",
                module: "readonly",
                require: "readonly",
                process: "readonly",
            },
        },

        rules: {
            semi: ["error", "always"],
            quotes: ["error", "double"],

            "no-unused-vars": "warn",
            "no-console": "off",

            eqeqeq: "error",
            "no-var": "error",
            "prefer-const": "error",
        },
    },

    // Browser context (for page.evaluate)
    {
        files: ["**/*.js"],
        languageOptions: {
            globals: {
                document: "readonly",
                window: "readonly",
            },
        },
    },
];
