const tokenize = require('./tokenizer');
const parse = require('./parse');
const transform = require('./transform');


function compiler(input) {
    const token = tokenize(input);
    console.log('compiler token :', token)

}

const str = "const data = 2 + (4 + 2) ";

// const str1 = ' data = (add 2 (subtract 4 2))';

compiler(str);
// compiler(str1);

// module.exports = compiler;