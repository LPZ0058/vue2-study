/*
 * @Author: 蓝胖子007 1829390613@qq.com
 * @Date: 2023-02-11 13:37:32
 * @LastEditors: 蓝胖子007 1829390613@qq.com
 * @LastEditTime: 2023-02-11 13:51:00
 * @FilePath: \vue\vue2\.eslintrc.js
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    mocha: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/triple-slash-reference": "off",
    // "@typescript-eslint/no-var-requires": "off",
  },
};
