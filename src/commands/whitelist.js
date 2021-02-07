const Command = require('chat-commands/src/command');
const blacklist = require('../blacklist');

module.exports = new Command({
  title: '',
  alias: ['whitelist', 'wl'],
  examples: [],
  usage: '',
  description: 'Command whitelist.\nAny channel not on the whitelist disables most bot commands.',
  flags: [{
    alias: ['add']
  }, {
    alias: ['remove']
  }, {
    alias: ['clear']
  }],
  disabled: (msg) => !msg.channel.permissionsOf || !msg.channel.permissionsOf(msg.author.id).has('manageRoles'),
  handler(msg, args, flags) {
    return blacklist(msg, flags, {
      type: 'whitelist',
      server: msg.guildID || msg.channel.guild.id,
      channel: msg.channel.id,
    });
  },
});
