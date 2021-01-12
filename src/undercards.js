const { default: axios } = require('axios');

module.exports = axios.create({
  baseURL: 'https://undercards.net',
});
