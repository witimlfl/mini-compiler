// 生成器
function generator(node) {
	// console.log('generator ------------------->', node);
	switch (node.type) {
		case 'Program':
			return node.body.map(generator).join('\n');
		case 'ExpressionStatement':
			return (generator(node.expression) + ';');
		case 'CallExpression':
			return (`${generator(node.callee)}(${node.arguments.map(generator).join(',')})`);
		case 'Identifier':
			return node.value;
		case 'NumericLiteral':
			return node.value;
		default:
			throw new TypeError(node.type);
	}

}
module.exports = generator;
