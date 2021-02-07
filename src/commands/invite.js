const Command = require('chat-commands/src/command');
const disabled = require('../disabled');

function handler(context, args = [], flags = {}) {
  const invite = process.env.INVITE;
  return {
    embed: {
      description: `[Add me to your server!](${invite})`,
    },
  };
}

module.exports = new Command({
  title: '',
  alias: ['invite', 'link'],
  examples: [],
  usage: '',
  description: 'Add me to your server!',
  disabled: (msg) => !process.env.INVITE || disabled(msg),
  flags: [],
  handler,
});
