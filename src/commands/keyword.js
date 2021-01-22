const Command = require('chat-commands/src/command');
const { events, translate } = require('../lang');
const { simpleMode } = require('../lang/extend');

const cache = new Map();
const prefix = 'kw-'

events.on('load', (data) => {
  cache.clear();
  simpleMode();
  Object.keys(data).forEach((key) => {
    if (!key.startsWith(prefix) || key.endsWith('-desc')) return;
    cache.set(key, {
      name: translate(key),
      description: translate(`${key}-desc`),
    });
  });
  // Manually add KR, this is the *only* keyword that doesn't have a card description
  cache.set('status-kr', {
    name: translate('stat-kr'),
    description: translate('status-kr'),
  })
});

function handler(msg, args = [], flags = {}) {
  const needle = args.join('-').toLowerCase();
  if (!needle) return '* No keyword provided';
  const { name, description } = cache.get(`${prefix}${needle}`) || {};
  if (!name) return `* ${args.join(' ')} not found`;
  return {
    embed: {
      title: name,
      description,
    },
  };
}

module.exports = new Command({
  title: '',
  alias: ['keyword', 'kw', 'effect'],
  examples: [],
  usage: [],
  description: 'Get the description of a keyword',
  flags: [],
  handler,
});
