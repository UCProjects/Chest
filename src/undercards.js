const { default: axios } = require('axios');
const { agent } = require('./proxy');

module.exports = axios.create({
  baseURL: 'https://undercards.net',
  httpsAgent: agent,
  proxy: false,
});
