
const fs = require('fs');
const content = fs.readFileSync('p:/LMS/frontend/src/_pages_vite/hr/StudentManagement.jsx', 'utf8');
let braces = 0;
let parens = 0;
let brackets = 0;
for (let char of content) {
    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '(') parens++;
    if (char === ')') parens--;
    if (char === '[') brackets++;
    if (char === ']') brackets--;
}
console.log(`Braces: ${braces}, Parens: ${parens}, Brackets: ${brackets}`);
