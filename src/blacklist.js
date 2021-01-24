const Configstore = require('configstore');

const config = new Configstore('robot-98');

module.exports = (context, flags, {
  type, server, channel,
}) => {
  const path = `discord.${server}.${type}`;
  if (flags.clear) {
    config.delete(path);
    return `Cleared ${type}`;
  } else if (flags.add) {
    config.set(`${path}.${channel}`, true);
    return `Added channel to ${type}`;
  } else if (flags.remove) {
    config.delete(`${path}.${channel}`);
    return `Removed channel from ${type}`;
  } else if (config.has(path)) {
    return `Current ${type}: ${Object.keys(config.get(path)).map(id => {
      const channel = context.connection.getChannel(id);
      if (channel) return channel.mention;
      // Channel no longer exists - remove from memory
      config.delete(`${path}.${id}`);
      return undefined;
    }).filter(_=>_).join(', ')}`;
  } else {
    const sub = type === 'whitelist' ? 'blacklist for disabled' : 'whitelist for allowed';
    return `No ${type} - see ${sub} channels!`
  }
};
