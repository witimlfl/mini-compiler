const complier = require('./complier');

const input = "`I am ${ name } from China`"
const output = complier(input)

console.log('\ninput ===>', input);
console.log('\noutput ===>', output);