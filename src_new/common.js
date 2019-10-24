/**
 * Created by witim on 2019/10/23.
 */
/* 词法分析 切词： input -> tokens */
const KEYWORDS = ['let', 'const', 'var'];
const OPERATOR = ['(', ')', '+', '-', '*', '=', ';'];

function tokenizer(input) {
    let current = 0;
    const tokens = [];
    let flag = false;

    while (current < input.length) {
        let char = input[current];
        // console.log('---->', current, char)
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

        // token是符号类型
        if (OPERATOR.indexOf(char) > -1) {
            tokens.push({
                type: 'operator',
                value: char,
            });
            current++;
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
    return tokens;
}
// module.exports = tokenizer;


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
					expressions: [],
					quasis: []
				},
			};
			// 处理表达式后面的内容
			token = tokens[++current];
			console.log(' token*******> ',token)
			
			stark.push(token);
			
			while (token.type !== '`' || stark.length === 0) {
				const data = walk();
				if(data && data.type === 'Identifier') {
					node.expression.expressions.push(data);
				}
				if(data && data.type === 'TemplateElement') {
					node.expression.quasis.push(data);
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
		throw new TypeError('stark error:' + stark)
    }
	console.log('parse ast:', JSON.stringify(ast))
	return ast;
	
}

const str = "`I am ${ name } 18 years`"
const tokens = tokenizer(str);
const ast = parser(tokens);
// console.log('tokens ----->', tokens);
console.log('ast ----->', ast, JSON.stringify(ast));