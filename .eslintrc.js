module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },

  "parserOptions": {
    "sourceType": "module"
  },

  "rules": {
    "no-undef": "error"
  },

  "overrides": [
    {
      "files": "index.d.ts",
      "parser": "@typescript-eslint/parser",
      "plugins": [
        "@typescript-eslint"
      ]
    }
  ]
};
