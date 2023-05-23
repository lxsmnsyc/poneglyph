module.exports = {
  "root": true,
  "extends": [
    'lxsmnsyc/typescript/react',
  ],
  "parserOptions": {
    "project": "./tsconfig.eslint.json",
    "tsconfigRootDir": __dirname,
  },
  "rules": {
    "import/no-extraneous-dependencies": [
      "error", {
        "devDependencies": ["**/*.test.ts"]
      }
    ],
    "react/prop-types": "off",
    "react/destructuring-assignment": "off"
  }
};