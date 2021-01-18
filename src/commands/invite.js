const Command = require('chat-commands/src/command');

function handler(context, args = [], flags = {}) {
  const invite = process.env.INVITE;
  if (invite) return {
    embed: {
      description: `[Add me to your server!](${invite})`,
    },
  };
  return undefined;
}

module.exports = new Command({
  title: '',
  alias: ['invite', 'link'],
  examples: [],
  usage: [],
  description: '',
  flags: [],
  handler,
});
