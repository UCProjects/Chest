const Command = require('chat-commands/src/command');
const { load, all: allCards } = require('../cache');
const { translate } = require('../lang');
const { simpleMode } = require('../lang/extend');
const toArray = require('../util/array');
const disabled = require('../disabled');
const validate = require('../util/validate');
const paginator = require('../util/pagination');
const arrayChunk = require('../util/arrayChunk');

function handler(msg, args = [], flags = {}) {
  return load().then(() => {
    const cards = allCards();
    cards.forEach((card) => {
      simpleMode();
      card.name = translate(`card-name-${card.id}`, 1);
      card.description = translate(`card-${card.id}`).replace(/__|\*\*/g, '');
    });

    const ids = this.flag('id', flags);
    const names = this.flag('name', flags);
    const costs = this.flag('cost', flags);
    const descs = this.flag('description', flags);
    const atks = this.flag('attack', flags);
    const hps = this.flag('health', flags);
    const rarities = this.flag('rarity', flags);
    const types = this.flag('type', flags);
    const souls = this.flag('soul', flags);
    const tribes = this.flag('tribe', flags);
    const cardTypes = getTypes(flags);

    const results = cards.filter(card => validate(`${card.id}`, ids) &&
      validate(card.name, names, false) &&
      validate(`${card.cost}`, costs) &&
      validate(card.description, descs, false) &&
      validate(`${card.attack}`, atks) &&
      validate(`${card.hp}`, hps) &&
      validate(card.rarity, rarities) &&
      validate(card.extension, types) &&
      validate(card.soul?.name ?? '', souls) &&
      validate(card.tribes, tribes) &&
      validate(card.typeCard, cardTypes));

    return paginator(msg, arrayChunk(results), {
      renderer(data = [], current) {
        const offset = (current - 1) * 10;
        return {
          embed: {
            title: `${results.length} Search Results`,
            description: data.map((card, i) => `${i + offset + 1}. ${card.name}`).join('\n') || '* No results',
          },
        }
      },
    });
  });
}

function getTypes(flags) {
  const cardTypes = [];
  if (flags.monster) cardTypes.push(0);
  if (flags.spell) cardTypes.push(1);
  return cardTypes;
}

function converter(data) {
  if (data === true || data === undefined || data === '') return [];
  return toArray(data);
}

module.exports = new Command({
  title: '',
  alias: ['search', 'find', '?'],
  examples: [],
  usage: '',
  description: 'Look up cards via search parameters',
  flags: [{
    alias: ['id', '#'],
    description: 'Search for card IDs',
    converter,
  }, {
    alias: ['name'],
    description: 'Search card names',
    converter, // TODO: fuzzy search cards and convert to full names
  }, {
    alias: ['cost', '$', 'gold'],
    description: 'Search card cost',
    converter,
  }, {
    alias: ['description', 'desc', 'text', 'flavor'],
    description: 'Search descriptions',
    converter,
  }, {
    alias: ['attack', 'atk'],
    description: 'Search card attack',
    converter,
  }, {
    alias: ['health', 'hp'],
    description: 'Search card health',
    converter,
  }, {
    alias: ['rarity'],
    description: 'Search card rarity',
    converter,
  }, {
    alias: ['type', 'extension', 'family'],
    description: 'Search card type. (base, deltarune)',
    converter,
  }, {
    alias: ['soul', 'class'],
    description: 'Search card soul',
    converter,
  }, {
    alias: ['tribe'],
    description: 'Search card tribe',
    converter,
  }, {
    alias: ['monster'],
    description: 'Search monster cards',
    converter,
  }, {
    alias: ['spell'],
    description: 'Search spell cards',
    converter,
  }],
  disabled,
  handler,
});
