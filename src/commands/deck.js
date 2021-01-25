const Command = require('chat-commands/src/command');
const { find: findSoul, souls } = require('../souls');
const { artifacts, fetch: loadArtifacts } = require('../artifacts');
const { load: loadCards, all: allCards } = require('../cache');
const { translate } = require('../lang');
const { normalMode } = require('../lang/extend');
const { deck: image } = require('../image');
const disabled = require('../disabled');
const random = require('../util/random');

// Generate a deck (25 cards), for X soul, with min of Y spells, using rarity constraints
const limits = {
  BASE: 3,
  COMMON: 3,
  RARE: 3,
  EPIC: 2,
  LEGENDARY: 1,
  DETERMINATION: 1,
};

const colors = {
  KINDNESS: 49152,
  JUSTICE: 16776960,
  PATIENCE: 4324607,
  PERSEVERANCE: 13972953,
  BRAVERY: 16557312,
  DETERMINATION: 16711680, 
  INTEGRITY: 25855,
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
        cards: generateDeck(soul, flags),
        artifacts: getArtifacts(),
      };

      return msg.reply({
        embed: {
          title: `${data.soul.name} Deck`,
          description: deckCode(data),
          color: colors[soul],
          image: {
            url: 'attachment://deck.png',
          },
        },
      }, {
        name: 'deck.png',
        file: await image(data),
      });
    });
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
  },/*{
    alias: ['blacklist', 'bl'],
    usage: '',
    description: 'Blacklist a card from the deck',
  }*/],
  disabled: (msg) => disabled(msg.guildID || msg.channel.guild.id, msg.channel.id),
  handler,
});

function getSoul(input) {
  if (!input) return random(souls);
  return findSoul(input);
}

function getArtifacts() {
  const ret = [];
  const arts = [...artifacts.values()].filter(a => !a.unavailable);
  ret.push(random(arts));
  if (!ret[0].legendary) {
    const commons = arts.filter(a => !a.legendary && a !== ret[0]);
    ret.push(random(commons));
  }
  // Translate name
  ret.forEach(art => art.name = translate(`artifact-name-${art.id}`));
  return ret;
}

function generateDeck(soul, {
  ranked = false,
  // TODO: blacklist support
  blacklist = [],
}) {
  const cards = allCards()
    .filter(card => card.rarity !== 'TOKEN' && (!card.soul || card.soul.name === soul)); // Not token, no soul requirement, or matches soul

  const counts = new Map();
  let dtFlag = false;

  const deck = [];
  while (deck.length < 25) {
    const card = random(cards);
    const amt = counts.get(card.id) || 0;
    if (amt === limits[card.rarity]) continue;
    if (ranked && card.rarity === 'DETERMINATION') {
      if (dtFlag) continue;
      dtFlag = true;
    }
    deck.push(card);
    counts.set(card.id, amt + 1);
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
