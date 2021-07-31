const Configstore = require('configstore');

const config = new Configstore('robot-98');

exports.get = (msg, flags = {}) => {
  const server = msg.guildID;
  if (!server || !flags.bypass) {
    const mode = config.get(`discord.${server}.mode`);
    if (mode) return mode;
  }
  return 'normal';
};

exports.set = (msg, mode) => {
  const server = msg.guildID || msg.channel.guild.id;
  if (server) {
    const key = `discord.${server}.mode`;
    if (mode) {
      config.set(key, mode);
    } else {
      config.delete(key);
    }
  }
};
