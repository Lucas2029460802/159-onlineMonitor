import { fixupConfigRules } from "@eslint/compat";
import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import reactJsx from "eslint-plugin-react/configs/jsx-runtime.js";
import react from "eslint-plugin-react/configs/recommended.js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import ts from "typescript-eslint";

export default [
    { languageOptions: { globals: globals.browser } },
    js.configs.recommended,
    ...ts.configs.recommended,
    ...fixupConfigRules([
        {
            ...react,
            settings: {
                react: { version: "detect" },
            },
        },
        reactJsx,
    ]),
    {
        plugins: {
            "react-hooks": reactHooks,
            prettier: prettier,
            import: importPlugin,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "prettier/prettier": "error",
            "import/order": [
                "error",
                {
                    groups: [
                        ["builtin", "external"],
                        ["internal"],
                        ["parent", "sibling", "index"],
                    ],
                    "newlines-between": "always",
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true,
                    },
                },
            ],
        },
    },
    { ignores: ["dist/"] },
];
