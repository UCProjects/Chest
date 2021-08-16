const Conf = require('conf');

const config = new Conf();

exports.get = (msg) => {
  const mode = config.get(`mode.${msg.channel.id}`);
  return mode || 'normal';
};

exports.set = (msg, mode) => {
  const key = `mode.${msg.channel.id}`;
  if (mode) {
    config.set(key, mode);
  } else {
    config.delete(key);
  }
};
