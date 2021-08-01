const Configstore = require('configstore');

const config = new Configstore('robot-98');

exports.get = (msg, flags = {}) => {
  if (!flags.bypass) {
    const mode = config.get(`discord.${msg.channel.id}.mode`);
    if (mode) return mode;
  }
  return 'normal';
};

exports.set = (msg, mode) => {
  const key = `discord.${msg.channel.id}.mode`;
  if (mode) {
    config.set(key, mode);
  } else {
    config.delete(key);
  }
};
