const Command = require('chat-commands/src/command');
const { all: allCards } = require('../cache');
const { aliases } = require('../souls');
const disabled = require('../disabled');
const { events, translate } = require('../lang');
const { simpleMode } = require('../lang/extend');

const cache = new Map();
const prefix = 'soul-'

events.on('load', (data) => {
  cache.clear();
  simpleMode();
  Object.keys(data).forEach((key) => {
    if (!key.startsWith(prefix) || key.endsWith('-desc')) return;
    const name = translate(key);
    cache.set(key, {
      name,
      aliases: aliases(name),
      description: translate(`${key}-desc`),
    });
  });
});

function handler(msg, args = [], flags = {}) {
  const needle = args.join(' ').toLowerCase();
  if (!needle) return {
    embed: {
      title: 'Souls',
      description: [...cache.values()].map(({ name }) => name).join(', '),
    }
  };
  const { name, description } = [...cache.values()]
    .find(({ aliases }) => aliases.includes(needle)) || {};
  if (!name) return `* Soul \`${args.join(' ')}\` not found`;
  const cards = allCards().filter(({ soul: { name: soul } = {} }) => soul === name);
  return {
    embed: {
      title: name,
      description,
      fields: [{
        name: `Cards`,
        value: cards.map(({ name }) => name).join('\n') || 'None',
      }],
    },
  };
}

module.exports = new Command({
  title: '',
  alias: ['soul', 'class'],
  examples: [],
  usage: '[soul]',
  description: 'Get description and cards for a soul',
  flags: [],
  disabled: (msg) => disabled(msg.guildID || msg.channel.guild.id, msg.channel.id),
  handler,
});
