const babel = require('@babel/core');
const fs = require('fs');
try {
  babel.transformSync(fs.readFileSync('src/staff-directory.jsx', 'utf8'), {
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-proposal-optional-chaining'],
    filename: 'src/staff-directory.jsx'
  });
  console.log("staff-directory syntax is OK!");
} catch(e) {
  console.log("Error in staff-directory: ", e.message);
}
