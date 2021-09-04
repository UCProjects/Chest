const Command = require('chat-commands/src/command');
const disabled = require('../disabled');

function handler(msg) {
  return msg.reply('Ping...').then((pong) => {
    const ping = pong.timestamp - msg.timestamp;
    return pong.edit(`Ping: ${ping}ms`);
  });
}

module.exports = new Command({
  title: '',
  alias: ['ping', 'pong'],
  examples: [],
  usage: '',
  description: 'Check ping',
  flags: [],
  handler,
  disabled,
});
