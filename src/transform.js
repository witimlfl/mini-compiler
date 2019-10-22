/**
 * ============================================================================
 *                                   转换器!!!
 * ============================================================================
 */

/**
 * 下面是转换器。转换器接收我们在之前构建好的 AST，然后把它和 visitor 传递进入我们的遍历
 * 器中 ，最后得到一个新的 AST。
 *
 * ----------------------------------------------------------------------------
 *            原始的 AST               |               转换后的 AST
 * ----------------------------------------------------------------------------
 *   {                                |   {
 *     type: 'Program',               |     type: 'Program',
 *     body: [{                       |     body: [{
 *       type: 'CallExpression',      |       type: 'ExpressionStatement',
 *       name: 'add',                 |       expression: {
 *       params: [{                   |         type: 'CallExpression',
 *         type: 'NumberLiteral',     |         callee: {
 *         value: '2'                 |           type: 'Identifier',
 *       }, {                         |           name: 'add'
 *         type: 'CallExpression',    |         },
 *         name: 'subtract',          |         arguments: [{
 *         params: [{                 |           type: 'NumberLiteral',
 *           type: 'NumberLiteral',   |           value: '2'
 *           value: '4'               |         }, {
 *         }, {                       |           type: 'CallExpression',
 *           type: 'NumberLiteral',   |           callee: {
 *           value: '2'               |             type: 'Identifier',
 *         }]                         |             name: 'subtract'
 *       }]                           |           },
 *     }]                             |           arguments: [{
 *   }                                |             type: 'NumberLiteral',
 *                                    |             value: '4'
 * ---------------------------------- |           }, {
 *                                    |             type: 'NumberLiteral',
 *                                    |             value: '2'
 *                                    |           }]
 *         (那一边比较长/w\)           |         }]
 *                                    |       }
 *                                    |     }]
 *                                    |   }
 * ----------------------------------------------------------------------------
 */

const visitor = {
	NumericLiteral: function (node, parent) {
		parent._context.push({
			type: 'NumericLiteral',
			value: node.value,
		})
	},
	CallExpression: function (node, parent) {
		let expression = {
			type: 'CallExpression',
			callee: {
				type: 'Identifier',
				value: node.name,
			},
			arguments: []
		};
		node._context = expression.arguments;
		if(parent.type !== 'CallExpression') {
			expression = { // CallExpression包一层ExpressionStatement节点
				type: 'ExpressionStatement',
				expression: expression,
			}
		}
		parent._context.push(expression);
	},
	// Identifier: function (node, parent) {
	// 	parent._context.push({
	// 		type: 'NumberLiteral',
	// 		value: node.value + '2'
	// 	})
	// }
};

function transform(ast) {
	const newAst = {
		type: 'Program',
		body: []
	};
	ast._context = newAst.body;
	traverser(ast, visitor);
	return newAst;

}

function traverser(ast, visitor) {
	function traverseArray(array, parent) {
		array.forEach(child => traverseNode(child, parent))
	}
	
	function traverseNode(node, parent) {
		const method = visitor[node.type];
		if(method) {
			method(node, parent);
		}
		
		switch (node.type) {
			case 'Program':
				traverseArray(node.body, node);
				break;
			case 'CallExpression':
				traverseArray(node.params, node);
				break;
			case 'NumericLiteral':
				break;
			default:
				throw new TypeError(node.type);
		}
	}
	
	traverseNode(ast, null)

}

module.exports = transform;