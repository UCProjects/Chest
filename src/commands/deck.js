const Command = require('chat-commands/src/command');
const { find: findSoul, souls, colors } = require('../souls');
const { artifacts, fetch: loadArtifacts } = require('../artifacts');
const { load: loadCards, all: allCards, getSync } = require('../cache');
const { translate } = require('../lang');
const { normalMode } = require('../lang/extend');
const { deck: image } = require('../image');
const disabled = require('../disabled');
const parseFlags = require('chat-commands/src/flags');
const random = require('../util/random');
const array = require('../util/array');

// Generate a deck (25 cards), for X soul, with min of Y spells, using rarity constraints
const limits = {
  BASE: 3,
  COMMON: 3,
  RARE: 3,
  EPIC: 2,
  LEGENDARY: 1,
  DETERMINATION: 1,
};

function handler(msg, args = [], flags = {}) {
  return Promise.all([loadCards(), loadArtifacts()])
    .then(async () => {
      const soul = getSoul(args[0]);
      if (!soul) throw `* Soul \`${args[0]}\` not found`;
      
      normalMode();
      const data = {
        soul: { 
          id: soul,
          name: translate(`soul-${soul.toLowerCase()}`),
        },
        cards: generateDeck(soul, {
          ranked: flags.ranked,
          blacklist: array(this.flag('blacklist', flags)),
          include: array(getMultiFlags.call(this, msg, 'include')),
          exclude: array(this.flag('exclude', flags)).map(n => getSync(n)),
          singleton: this.flag('lib', flags),
        }),
        artifacts: getArtifacts(array(this.flag('artifact', flags))),
      };

      return {
        embed: {
          title: `${data.soul.name} Deck`,
          description: deckCode(data),
          color: colors[soul],
          image: {
            url: 'attachment://deck.png',
          },
        },
        file: {
          name: 'deck.png',
          file: await image(data),
        },
      };
    });
}

function getMultiFlags(msg, flag) {
  const filtered = msg.content.replace(/<@!/g, '<@');

  const {
    flags = {},
  } = parseFlags(filtered.substring(msg.prefix.length), false);

  return this.flag(flag, flags, false);
}

module.exports = new Command({
  title: '',
  alias: ['deck', 'generate', 'gen'],
  examples: [],
  usage: '[soul]',
  description: 'Generates a deck for optional soul',
  flags: [{
    alias: ['ranked'],
    usage: '',
    description: 'Allows up to 1 DT card',
  }, {
    alias: ['blacklist', 'bl'],
    usage: '',
    description: 'Blacklist a rarity from the deck',
  }, {
    alias: ['include', 'i', '+'],
    usage: '<card>',
    description: 'Include a card in the deck\n||Mystery bugged me so much for include, go bug him for me||',
  }, /* {
    alias: ['exclude', 'e', '!', '-'],
    description: 'Exclude a card in the deck',
  }, */, {
    alias: ['artifact', 'art', 'a'],
    description: 'Include an artifact in the deck',
  }, {
    alias: ['lib', '1', 'single', 'limit'],
    description: 'Only allow one of any card',
  }],
  disabled,
  handler,
});

function getSoul(input) {
  if (!input) return random(souls);
  return findSoul(input);
}

function getArtifacts(prefer = []) {
  const ret = [];
  const arts = [...artifacts.values()].filter(a => !a.unavailable);
  // Translate name
  arts.forEach(a => a.name = translate(`artifact-name-${a.id}`));
  let art = getArtifact(arts, prefer) || random(arts);
  ret.push(art);
  if (!ret[0].legendary) {
    const commons = arts.filter(a => !a.legendary && a !== ret[0]);
    art = getArtifact(commons, prefer) || random(commons);
    ret.push(art);
  }
  return ret;
}

function getArtifact(from = [], needles = []) {
  for (let needle of needles) {
    needle = needle.toLowerCase();
    for (let art of from) {
      if (needle === art.name.toLowerCase()) return art;
    }
  }
  return undefined;
}

function generateDeck(soul, {
  ranked = false,
  blacklist = [''],
  include = [''],
  exclude = [''],
  singleton = false,
}) {
  const cards = allCards()
    .filter((card, _, array) => card.rarity !== 'TOKEN' && (!card.soul || card.soul.name === soul) && // Not token, no soul requirement, or matches soul
      (!blacklist.length || !blacklist.some(n => n.toUpperCase() === card.rarity)) &&
      (!exclude.length || !exclude.includes(card)));

  const counts = new Map();
  let dtFlag = false;

  const deck = [];
  const limit = 25;

  function addCard(card) {
    const amt = counts.get(card.id) || 0;
    if (amt === limits[card.rarity]) return;
    if (amt && singleton) return;
    if (ranked && card.rarity === 'DETERMINATION') {
      if (dtFlag) return;
      dtFlag = true;
    }
    deck.push(card);
    counts.set(card.id, amt + 1);
  }

  include.some((needle) => {
    const card = getSync(needle);
    if (card && card.rarity !== 'TOKEN' && (!card.soul || card.soul.name === soul)) addCard(card);
    return deck.length === limit;
  });

  while (deck.length < limit) {
    const card = random(cards);
    addCard(card);
  }

  // Translate names
  deck.forEach(card => card.name = translate(`card-name-${card.id}`, 1));
  // Sort by cost then name
  deck.sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

  return deck;
}

function deckCode(data) {
  return Buffer.from(JSON.stringify({
    soul: data.soul.id,
    cardIds: data.cards.map(c => c.id),
    artifactIds: data.artifacts.map(a => a.id),
  })).toString('base64');
}
