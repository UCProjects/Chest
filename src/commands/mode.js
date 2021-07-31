const Command = require('chat-commands/src/command');
const { get, set } = require('../mode');

module.exports = new Command({
  alias: ['mode'],
  flags: [{
    alias: ['set', '+'],
  }, {
    alias: ['remove', '-', 'reset']
  }],
  handler(msg, args, flags) {
    const add = this.flag('+', flags);
    if (add) {
      set(msg, add);
      return `Mode set: ${add}`;
    } else if (this.flag('-', flags)) {
      set(msg, false);
      return 'Mode reset';
    } else {
      return `Mode: ${get(msg, flags)}`;
    }
  },
  disabled: (msg) => !msg.channel.permissionsOf || !msg.channel.permissionsOf(msg.author.id).has('manageRoles'),
});
