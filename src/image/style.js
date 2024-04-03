const fs = require('node:fs');

module.exports = fs.readFileSync(`${__dirname}/style.css`);
