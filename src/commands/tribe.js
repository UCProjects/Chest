const Command = require('chat-commands/src/command');
const { all: allCards } = require('../cache');
const disabled = require('../disabled');
const { events, translate } = require('../lang');
const { simpleMode } = require('../lang/extend');

const cache = new Map();
const prefix = 'tribe-'

const rarities = ['Token', 'Determination', 'Legendary', 'Epic', 'Rare', 'Common', 'Base' ];

events.on('load', (data) => {
  cache.clear();
  simpleMode();
  Object.keys(data).forEach((key) => {
    if (!key.startsWith(prefix)) return;
    cache.set(key, translate(key, 1));
  });
});

function handler(msg, args = [], flags = {}) {
  const needle = args.join(' ').toLowerCase();
  if (!needle) return {
    embed: {
      title: 'Tribes',
      description: [...cache.values()].join(', '),
    }
  };

  const key = [...cache.keys()]
    .find((key) => cache.get(key).toLowerCase() === needle);
  if (!key || typeof key !== 'string') return `* ${args.join(' ')} not found`;
  simpleMode();
  const tribe = key.substring(6).replace('-', '_').toUpperCase();
  const cards = allCards().filter(({ tribes }) => tribes.includes(tribe));

  const fields = [];
  rarities.forEach((name) => {
    const subset = cards.filter(({ rarity }) => rarity.toLowerCase() === name.toLowerCase());
    if (!subset.length) return;
    fields.push({
      name,
      value: subset.map(({name}) => name).join('\n'),
      inline: true,
    });
  });

  return {
    embed: {
      title: `${translate(key, cards.length)} (${cards.length})`,
      fields,
      thumbnail: {
        url: `https://undercards.net/images/tribes/${tribe}.png`,
        width: 16,
        height: 16,
      },
    },
  };
}

module.exports = new Command({
  title: '',
  alias: ['tribe'],
  examples: [],
  usage: '[tribe]',
  description: 'Show the cards in a tribe',
  flags: [],
  disabled: (msg) => disabled(msg.guildID || msg.channel.guild.id, msg.channel.id),
  handler,
});
