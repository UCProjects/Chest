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
    .find(({ name }) => aliases(name).includes(needle)) || {};
  if (!name) return `* Soul \`${args.join(' ')}\` not found`;
  const cards = allCards().filter(({ soul: { name: soul } = {} }) => soul === name);
  const fields = [{
    name: `Cards`,
    value: cards
      .filter(({ rarity }) => rarity !== 'TOKEN')
      .map(({ name }) => name).join('\n') || 'None',
    inline: true,
  }];
  const tokens = cards.filter(({ rarity }) => rarity === 'TOKEN');
  if (tokens.length) {
    fields.push({
      name: 'Tokens',
      value: tokens.map(({ name }) => name).join('\n'),
      inline: true,
    });
  }
  return {
    embed: {
      title: name,
      description,
      fields,
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
  disabled,
  handler,
});
