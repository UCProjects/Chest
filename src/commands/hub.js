const Command = require('chat-commands/src/command');
const { colors } = require('../souls');
const { artifacts, fetch: loadArtifacts } = require('../artifacts');
const { card } = require('../cache');
const { fetch: loadHub, rank, time, } = require('../hub');
const { deck: image } = require('../image');
const { translate } = require('../lang');
const { simpleMode, normalMode } = require('../lang/extend');
const disabled = require('../disabled');
const random = require('../util/random');
const paginator = require('../util/pagination');
const arrayChunk = require('../util/arrayChunk');
const validate = require('../util/validate');

function handler(msg, args = [], flags = {}) {
  return Promise.all([loadArtifacts(), loadHub()])
    .then(() => {
      const needle = args.join(' ') || false;
      const author = this.flag('author', flags);
      const difficulty = this.flag('difficulty', flags);
      const soul = this.flag('soul', flags);
      const type = this.flag('archetype', flags);
      const unfiltered = flags.newest ? time() : rank();
      const decks = unfiltered.filter(deck => validate(deck.name, needle, false) &&
        validate(difficulty, deck.difficulty) &&
        validate(soul, deck.data.soul) &&
        validate(type, deck.archetype) &&
        validate(author, deck.owner.username));

      if (flags.list || (decks.length > 1 && (needle || author && author !== true))) {
        return paginator(msg, arrayChunk(decks.map(deck => `${deck.name} - ${deck.owner.username}`)), {
          renderer(decks = [], page, total) {
            if (!total) return '* No deck found';
            return {
              embed: {
                title: `Hub Decks (${page}/${total})`,
                description: decks.join('\n'),
              },
            };
          },
        });
      }

      // Otherwise show a random one...?
      const deck = random(decks);
      if (!deck) return '* No deck found';
      return response(msg, deck);
    });
}

async function response(msg, deck) {
  const soul = deck.data.soul;
  simpleMode();
  const data = {
    soul: { 
      id: soul,
      name: translate(`soul-${soul.toLowerCase()}`),
    },
    cards: deck.data.cardIds.map(card),
    artifacts: deck.data.artifactIds.map(id => artifacts.get(id)),
  };

  normalMode();
  data.cards.forEach(card => card.name = translate(`card-name-${card.id}`, 1));
  data.artifacts.forEach(art => art.name = translate(`artifact-name-${art.id}`));

  return {
    embed: {
      author: {
        name: deck.owner.username,
        icon_url: `https://undercards.net/images/avatars/${deck.owner.avatar.image}.png`,
      },
      title: deck.name,
      timestamp: deck.date.toISOString(),
      description: deck.code,
      color: colors[soul],
      fields: [{
        name: translate('hub-archetype'),
        value: translate(`archetype-${deck.archetype.replace(/_/g, '-').toLowerCase()}`),
        inline: true,
      }, {
        name: translate('hub-difficulty'),
        value: translate(`difficulty-${deck.difficulty.replace(/_/g, '-').toLowerCase()}`),
        inline: true,
      }, {
        name: '🔼',
        value: deck.likes,
      }],
      thumbnail: {
        url: `https://undercards.net/images/cards/${deck.image}.png`,
      },
      image: {
        url: 'attachment://deck.png',
      },
    },
    file: {
      name: 'deck.png',
      file: await image(data),
    },
  };
}

module.exports = new Command({
  title: '',
  alias: ['hub'],
  examples: [],
  usage: '[deck name]',
  description: 'Find a deck from the hub',
  flags: [{
    alias: ['author', 'owner', 'user'],
    description: 'Limit results to provided author(s)',
  }, {
    alias: ['soul', 'class'],
    description: 'Limit results to provided soul(s)',
  }, {
    alias: ['difficulty'],
    description: 'Limit results to provided difficulty(s)',
  }, {
    alias: ['archetype', 'type'],
    description: 'Limit results to provided type(s)',
  }, {
    alias: ['newest'],
    description: 'Orders by date instead of rank',
  }, {
    alias: ['list'],
    description: 'Forces a list to be shown',
  }],
  disabled: (msg) => !process.env.UC_LOGIN || disabled(msg),
  handler,
});
