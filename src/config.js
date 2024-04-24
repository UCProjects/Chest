const Conf = require('conf');

module.exports = new Conf({
  configName: 'cache',
  serialize: (data) => JSON.stringify(data),
});
