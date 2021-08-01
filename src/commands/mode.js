const Command = require('chat-commands/src/command');
const { get, set } = require('../mode');

module.exports = new Command({
  alias: ['mode'],
  description: 'Change the message mode for a channel',
  flags: [{
    alias: ['set', '+'],
  }, {
    alias: ['remove', '-', 'reset']
  }],
  handler(msg, args, flags) {
    const add = this.flag('+', flags);
    let ret;
    if (add) {
      set(msg, add);
      ret = `Mode set: ${add}`;
    } else if (this.flag('-', flags)) {
      set(msg, false);
      ret =  'Mode reset';
    } else {
      ret = `Mode: ${get(msg, flags)}`;
    }
    // Force it to reply in the current channel
    return msg.channel.createMessage(ret);
  },
  disabled: (msg) => !msg.channel.permissionsOf || !msg.channel.permissionsOf(msg.author.id).has('manageRoles'),
});
