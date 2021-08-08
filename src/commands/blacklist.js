const Command = require('chat-commands/src/command');
const blacklist = require('../blacklist');

module.exports = new Command({
  title: '',
  alias: ['blacklist', 'bl'],
  examples: [],
  usage: '',
  description: 'Command blacklist\nAny channel in the blacklist disables most bot commands.',
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
      type: 'blacklist',
      server: msg.guildID || msg.channel.guild.id,
      channel: msg.channel.id,
    });
  },
});
