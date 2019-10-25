const tokenize = require('./tokenizer');
const parser = require('./parser');
const transform = require('./transform');
const generator = require('./generator');


function compiler(input) {
    const tokens = tokenize(input);
    const ast = parser(tokens);
    const newAst = transform(ast);
    const output = generator(newAst);
    // console.log('compiler parse ------------------------->:', ast)
    // console.log('compiler transform ======================>:',JSON.stringify(newAst), newAst)
    console.log('compiler generator ======================>:', JSON.stringify(newAst))
    console.log('compiler generator ======================>:', output);

}

// const str = "const data = 2 + (4 + 2) ";

const str1 = '(add 2 (subtract 4 2))';

// compiler(str);
compiler(str1);

// module.exports = compiler;