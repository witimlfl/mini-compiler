const ast = {
	type: 'Program',
	body: [
		{
			type: 'CallExpression',
			name: 'add',
			params: [
				{
					type: 'NumericLiteral',
					value: '2',
				},
				{
					type: 'CallExpression',
					name: 'subtract',
					params: [
						{
							type: 'NumericLiteral',
							value: '4',
						},
						{
							type: 'NumericLiteral',
							value: '2',
						},
					],
				},
			],
		},
	],
};
