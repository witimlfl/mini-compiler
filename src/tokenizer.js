/* 词法分析 切词： input -> tokens */
const KEYWORDS = ['let', 'const', 'var'];
const OPERATOR = ['(', ')', '+', '-', '*', '=', ';'];

function tokenizer(input) {
	let current = 0;
	const tokens = [];
	
	while (current < input.length) {
		let char = input[current];
		
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
		if (LETTERS.test(char)) {
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
		
		throw new TypeError(`I dont know what this character is: ${char}`);
	}
	// console.log('tokens -->', tokens);
	return tokens;
}
module.exports = tokenizer;
