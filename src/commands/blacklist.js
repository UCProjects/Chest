const Command = require('chat-commands/src/command');
const Configstore = require('configstore');

const config = new Configstore('robot-98');

const whitelist = ['whitelist', 'wl']
const blacklist = ['blacklist', 'bl'];

function handler(msg, args = [], flags = {}) {
  if (!msg.channel.permissionsOf(msg.author.id).has('manageRoles')) return;
  const type = blacklist.includes(msg.command) ? 'blacklist' : 'whitelist';
  const path = `discord.${msg.guildID || msg.channel.guild.id}.${type}`;
  if (flags.clear || args.includes('clear')) {
    config.delete(path);
    return `Cleared ${type}`;
  } else if (flags.add || args.includes('add')) {
    config.set(`${path}.${msg.channel.id}`, true);
    return `Added channel to ${type}`;
  } else if (flags.remove || args.includes('remove')) {
    config.delete(`${path}.${msg.channel.id}`);
    return `Removed channel from ${type}`;
  } else if (config.has(path)) {
    return `Current ${type}: ${Object.keys(config.get(path)).map(id => {
      const channel = msg.connection.getChannel(id);
      if (channel) return channel.mention;
      // Channel no longer exists - remove from memory
      config.delete(`${page}.${id}`);
      return undefined;
    }).filter(_=>_).join(', ')}`;
  } else {
    const sub = type === 'whitelist' ? 'blacklist for disabled' : 'whitelist for allowed';
    return `No ${type} - see ${sub} channels!`
  }
}

module.exports = new Command({
  title: '',
  alias: [...whitelist, ...blacklist],
  examples: [],
  usage: [],
  description: 'Command whitelist/blacklist',
  flags: [{
    alias: ['add']
  }, {
    alias: ['remove']
  }, {
    alias: ['clear']
  }],
  handler,
});
