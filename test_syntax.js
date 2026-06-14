const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');
const parser = acorn.Parser.extend(jsx());
try {
  parser.parse(fs.readFileSync('src/camp-dashboard.jsx', 'utf8'), { sourceType: 'module', ecmaVersion: 2022 });
  console.log("Syntax is OK");
} catch(e) {
  console.log("Syntax error: " + e.message);
}
