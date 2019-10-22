/* 词法分析 切词： input -> tokens */
const TYPEEMUN = {
	number: 'NumericLiteral',
	boolean: 'BooleanLiteral',
	name: 'Identifier',
};


function parser(tokens) {
	let current = 0;
 
	function walk() {
		let token = tokens[current];
		
		if(token.type === 'number') {
			current ++;
			return {
				type: 'NumericLiteral',
				value: token.value,
			}
		}
		
		if(token.type === 'operator' && token.value === '(') {
		    // 跳过
			token = tokens[++current];
			// 括号里面是表达式
			let node = {
				type: 'CallExpression',
				name: token.value,
				params: [],
			};
			// 处理表达式后面的内容
			token = tokens[++current];
		
			while (token.type !== 'operator' ||
			(token.type === 'operator' && token.value !== ')')) {
				const data = walk()
				node.params.push(data);
				token = tokens[current];
			}
			current ++;
		
			return node;
		}
		throw new TypeError(token.type);
	}
	
	const ast = {
		type: 'Program',
		body: [],
	};
    while(current < tokens.length) {
    	ast.body.push(walk())
    }
    // console.log('parse ast:', JSON.stringify(ast))
	return ast;
	
}

module.exports = parser;