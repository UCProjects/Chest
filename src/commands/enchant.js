const Command = require('chat-commands/src/command');
const disabled = require('../disabled');
const { events, translate } = require('../lang');
const { simpleMode } = require('../lang/extend');
const paginator = require('../util/pagination');
const arrayChunk = require('../util/arrayChunk');

const cache = new Map();
const prefix = 'enchant-';

events.on('load', (data) => {
  cache.clear();
  simpleMode();
  Object.keys(data).forEach((key) => {
    if (!key.startsWith(prefix) || key.endsWith('-desc')) return;
    const entry = {
      name: translate(key, 1),
      description: translate(`${key}-desc`),
    };
    cache.set(key, entry);
    if (key.endsWith('s')) return;
    cache.set(`${key}s`, entry);
  });
});

function handler(msg, args = [], flags = {}) {
  const needle = args.join('-').toLowerCase();
  if (!needle) return paginator(msg, arrayChunk([...new Set(cache.values())].map(({ name }) => name), 20), {
    renderer(keys, page, total) {
      return {
        embed: {
          title: `Enchantments [${page}/${total}]`,
          description: keys.join('\n'),
        },
      };
    }
  });
  const { name, description } = cache.get(`${prefix}${needle}`) || {};
  if (!name) return `* Enchant \`${args.join(' ')}\` not found`;
  return {
    embed: {
      title: name,
      description,
    },
  };
}

module.exports = new Command({
  title: '',
  alias: ['enchant', 'enchantment'],
  examples: [],
  usage: '[enchant]',
  description: 'Get the description of an enchantment',
  flags: [],
  disabled,
  handler,
});
