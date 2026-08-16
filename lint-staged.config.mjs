export default {
  '*.{js,mjs,cjs,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,css,md,yml,yaml}': 'prettier --write',
}
