/**
 * Created by witim on 2019/10/23.
 */

const KEYWORDS = ['let', 'const', 'var'];
/* 词法分析 切词： input -> tokens */
function tokenizer(input) {
    let current = 0;
    const tokens = [];
    let flag = false;

    while (current < input.length) {
        let char = input[current];
        if(flag && /[\w\s]+/i.test(char)) {
            let value = '';
            while (!(char === '$' || char === '`')) {
                value += char;
                char = input[++current];
            }
            tokens.push({
                type: 'template',
                value,
            });
            continue;
        }

        if(flag && char === '$') {
            let value = char;
            char = input[++current];
            if(char === '{') {
                flag = false;
                tokens.push({
                    type: '${',
                    value: value + char,
                });
                ++current;
                continue;
            } else {
                throw new TypeError(`I dont know what this character is: ${value}${char}`);
            }
        }

        if(char === '}') {
            flag = true;
            tokens.push({
                type: '}',
                value: char,
            });
            ++current;
            continue;
        }

        // 检查是否空格
        const WHITESPACE = /\s/;
        if (WHITESPACE.test(char)) {
            current++;
            continue;
        }

        // 处理数字字符
        const NUMBERS = /[0-9]/;
        if (NUMBERS.test(char)) {
            let value = '';
            while (NUMBERS.test(char)) {
                value += char;
                char = input[++current];
            }
            tokens.push({
                type: 'number',
                value,
            });
            continue;
        }

        // 处理字符串
        const LETTERS = /[a-z]/i;
        if (LETTERS.test(char) && !flag) {
            let value = '';
            while (LETTERS.test(char)) {
                value += char;
                char = input[++current];
            }

            // 区分KeyWord 或者是 普通变量
            const type = KEYWORDS.indexOf(value) > -1 ? 'keyword' : 'name';

            tokens.push({
                type,
                value,
            });
            continue;
        }

        if(char === '`') {
            tokens.push({
                type: '`',
                value: char,
            });
            flag = !flag;
            current++;
            continue;
        }

        throw new TypeError(`I dont know what this character is: ${char}`);
    }
    // console.log('\ntokens =============>\n', tokens);
    return tokens;
}

/* 语法分析 切词： tokens -> ast */
function parser(tokens) {
	let current = 0;
	
	let stark = [];
	
	function walk() {
		let token = tokens[current];
		
		if(token.type === '`' && stark.length === 0) {
			
			let node =  {
				type: 'ExpressionStatement',
				expression: {
					type: 'TemplateLiteral',
                    params: [],
				},
			};
			// 处理表达式后面的内容
			token = tokens[++current];
			
			stark.push(token);
			
			while (token.type !== '`' || stark.length === 0) {
				const data = walk();
				if(data && data.type === 'Identifier') {
					node.expression.params.push(data);
				}
				if(data && data.type === 'TemplateElement') {
					node.expression.params.push(data);
				}
				token = tokens[current];
			}
			if(token.type === '`') {
				stark.pop();
			}
			current ++;
			return node;
		}
		
		if(token.type === 'name') {
			const identifierNode =  {
				type: 'Identifier',
				value: token.value,
				loc: current,
			};
			current ++;
			return identifierNode;
		}
		
		if(token.type === 'template') {
			const templateNode =  {
				type: 'TemplateElement',
				value: token.value,
				loc: current,
			};
			current ++;
			return templateNode;
		}
		
		if(token.type === '${') {
			stark.push(token);
			current ++;
			return null;
		}
		
		if(token.type === '}') {
			current ++;
			stark.pop()
			return null;
		}
		
		throw new TypeError(token + token.type);
	}
	
	const ast = {
		type: 'Program',
		body: [],
	};
	while(current < tokens.length) {
		ast.body.push(walk())
    }
    if(stark.length !== 0) {
        //语法错误
		throw new TypeError('stark error:' + stark)
    }
	//console.log('\nparse ast =========> \n:', ast, '====>\n' JSON.stringify(ast))
	return ast;
	
}

/* 转换 ： ast -> newAst
* babel 插件作用于nodeVistor
*/
const nodeVistor = {
    ExpressionStatement: (node, parent) => {
        parent._context.push({
			type: 'ExpressionStatement',
			expression: node.expression,
		})
    },
    TemplateLiteral: (node, parent) => {
        let expression = {
            type: 'TemplateExpression',
            params: [],
        };
        node.type = expression.type;
        node._context = expression.params;
        parent._context = expression;
    },
    TemplateElement: (node, parent) => {
        parent._context.push({
            type: 'Literal',
            value: node.value,
        })
    },
    Identifier: (node, parent) => {
        parent._context.push({
            type: 'Identifier',
            value: node.value,
        })
    },
};
function transform(ast) {
    const newAst = {
        type: 'Program',
        body: []
    };
    // 父结点上使用一个属性 `context`（上下文）， 可以把结点放入他们父结点的 context 中
    // 注意 context 是一个*引用*，从旧的 AST 到新的 AST。
    ast._context = newAst.body;
    traverser(ast, nodeVistor);
    return newAst;

}
function traverser(ast, visitor) {
    function traverseArray(array, parent) {
        array.forEach(child => traverseNode(child, parent))
    }

    function traverseNode(node, parent) {
        const method = visitor[node && node.type];
        if(method) {
            method(node, parent);
        }
        switch (node && node.type) {
            case 'Program':
                traverseArray(node.body, node);
                break;
            case 'ExpressionStatement':
                traverseNode(node.expression, node);
                break;
            case 'TemplateExpression':
                traverseArray(node.params, node);
                 break;
            case 'TemplateElement':
            case 'Literal':
            case 'Identifier':
                break;
            default:
                throw new TypeError(node && node.type);
        }
    }

    traverseNode(ast, null)

}

/**
 * generator 代码生成器:
 * 代码生成器会递归地调用它自己，把 AST 中的每个结点打印到一个很大的字符串中。
 * */
function generator(node) {
    switch (node.type) {
        case 'Program':
            return node.body.map(generator).join('\n');
        case 'ExpressionStatement':
            return (generator(node.expression) + ';');
        case 'TemplateExpression':
            return (`${(node._context || node.params).map(generator).join(' + ')}`);
        case 'Identifier':
            return node.value;
        case 'Literal':
        case 'TemplateElement':
            return `'${node.value}'` ;
        default:
            throw new TypeError(node.type);
    }

}

/**
 * compiler 函数，它只是把上面说到的那些函数连接到一起。
 *
 *   1. input  => tokenizer   => tokens
 *   2. tokens => parser      => ast
 *   3. ast    => transformer => newAst
 *   4. newAst => generator   => output
 */
function compiler(input) {
	const tokens = tokenizer(input);
	const ast = parser(tokens);
	const newAst = transform(ast);
	const output  = generator(newAst);
	return output
}

module.exports = compiler


const input = "`I am ${ name } from China`"
const tokens = tokenizer(input);
// const ast = parser(tokens);
// const newAst = transform(ast);
// const output  = generator(newAst);
console.log('--------------tokens ----->', tokens);
// console.log('--------------ast ----->', JSON.stringify(ast));
// console.log('---------------newAst ----->', JSON.stringify(newAst));
// console.log('----------------output ----->', output);