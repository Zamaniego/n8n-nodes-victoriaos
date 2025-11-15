import pluginN8nNodesBase from 'eslint-plugin-n8n-nodes-base';

export default [
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			parserOptions: {
				project: './tsconfig.json',
			},
		},
	},
	...pluginN8nNodesBase.configs.recommended,
];
