const Command = require('chat-commands/src/command');
const disabled = require('../disabled');
const { events, translate } = require('../lang');
const { simpleMode } = require('../lang/extend');

const cache = new Map();
const prefix = 'kw-'

events.on('load', (data) => {
  cache.clear();
  simpleMode();
  // Manually add KR, this is the *only* keyword that doesn't have a description
  cache.set('kw-kr', {
    name: translate('stat-kr'),
    description: translate('status-kr'),
  });
  // Manually add determination, this is the only status that is applied because of RARITY (and isn't explained anywhere else)
  cache.set('kw-determination', {
    name: translate('soul-determination'),
    description: translate('status-determination'),
  });
  // Manually add another chance, a reworked spell (the status still exists though)
  if (data['status-another-chance']) {
    cache.set('kw-another-chance', {
      name: 'Another Chance',
      description: translate('status-another-chance'),
    });
  }
  cache.set()
  Object.keys(data).forEach((key) => {
    if (!key.startsWith(prefix) || key.endsWith('-desc')) return;
    cache.set(key, {
      name: translate(key),
      description: translate(`${key}-desc`),
    });
  });
});

function handler(msg, args = [], flags = {}) {
  const needle = args.join('-').toLowerCase();
  if (!needle) return '* No keyword provided';
  const { name, description } = cache.get(`${prefix}${needle}`) || {};
  if (!name) return `* Keyword \`${args.join(' ')}\` not found`;
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
  usage: '[keyword]',
  description: 'Get the description of a keyword',
  flags: [],
  disabled: (msg) => disabled(msg.guildID || msg.channel.guild.id, msg.channel.id),
  handler,
});
