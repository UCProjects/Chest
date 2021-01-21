const Command = require('chat-commands/src/command');
const { all: allCards } = require('../cache');
const { events, translate } = require('../lang');
const { simpleMode } = require('../lang/extend');

const cache = new Map();
const prefix = 'tribe-'

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
  return {
    embed: {
      title: `${translate(key, cards.length)} (${cards.length})`,
      description: cards.length ? cards.map(({name}) => name).join(', ').substring(0, 2000) : 'None',
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
  usage: [],
  description: 'Show the cards in a tribe',
  flags: [],
  handler,
});
