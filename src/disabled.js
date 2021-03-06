const Configstore = require('configstore');

const config = new Configstore('robot-98');

module.exports = (msg) => {
  const server = msg.guildID;
  if (!server) return false;
  const channel = msg.channel.id;
  const prefix = `discord.${server}`;
  return config.has(`${prefix}.blacklist.${channel}`) || // Is on the black list OR
    config.has(`${prefix}.whitelist`) && // Has a whitelist BUT
    !config.has(`${prefix}.whitelist.${channel}`); // is not on the whitelist
};
