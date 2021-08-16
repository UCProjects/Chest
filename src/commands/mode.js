const Command = require('chat-commands/src/command');
const { get, set } = require('../mode');

module.exports = new Command({
  alias: ['mode'],
  description: 'Change the message mode for a channel',
  flags: [{
    alias: ['set', '+'],
  }, {
    alias: ['remove', '-', 'reset']
  }, {
    alias: ['note'],
    converter: (data) => Array.isArray(data) ? data.join('\n') : data,
  }],
  handler(msg, args, flags) {
    const add = this.flag('+', flags);
    let ret;
    if (add) {
      const mode = {
        value: add,
        note: this.flag('note', flags),
      };
      set(msg, mode);
      ret = `Mode set: ${add}`;
    } else if (this.flag('-', flags)) {
      set(msg, false);
      ret =  'Mode reset';
    } else {
      ret = `Mode: ${get(msg, flags).value}`;
    }
    // Force it to reply in the current channel
    return msg.channel.createMessage(ret);
  },
  disabled: (msg) => !msg.channel.permissionsOf || !msg.channel.permissionsOf(msg.author.id).has('manageRoles'),
});
