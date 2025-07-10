module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:tailwindcss/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['tailwindcss', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'warn',
  },
  settings: {
    tailwindcss: {
      config: './tailwind.config.js',
    },
  },
};