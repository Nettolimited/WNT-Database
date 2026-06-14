const babel = require('@babel/core');
const fs = require('fs');
try {
  babel.transformSync(fs.readFileSync('src/camp-dashboard.jsx', 'utf8'), {
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-proposal-optional-chaining'],
    filename: 'src/camp-dashboard.jsx'
  });
  console.log("Syntax is OK!");
} catch(e) {
  console.log(e.message);
}
