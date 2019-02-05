module.exports = {
	root: true,
	parserOptions: {
		sourceType: 'module',
		parser: 'babel-eslint',
		ecmaVersion: 2017
	},
	extends: [ 'plugin:unicorn/recommended', 'plugin:vue/recommended', 'prettier', 'prettier/unicorn', 'prettier/vue' ],
	plugins: [ 'prettier', 'unicorn', 'vue' ],
	env: {
		es6: true,
		node: true,
		browser: true
	},
	rules: {
		'prettier/prettier': 'error'
	}
};
