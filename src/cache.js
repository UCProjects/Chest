const undercards = require('./undercards');
const { translate, load } = require('./lang');
const { normalMode } = require('./lang/extend');
const random = require('./util/random');

const cards = new Map();

const day = 24 * 60 * 1000;
let next = Date.now();

exports.load = () => {
  if (Date.now() < next) return load();
  return Promise.all([undercards.get('/AllCards'), load()])
    .then(([{ data: { cards: newCards } }]) => {
      if (newCards) {
        cards.clear(); // Remove old cards
        JSON.parse(newCards).forEach(card => cards.set(card.id, card));
      }
      next = Date.now() + day;
    }).catch(console.error);
};

exports.get = (name) => exports.load()
  .then(() => getClosest(name, [...cards.values()]));

exports.getSync = (name) => getClosest(name, [...cards.values()]);

exports.card = (id) => cards.get(id);
  
exports.all = () => [...cards.values()];

exports.pick = (rarity = 'any', type = 'mix', baseIsCommon = true) => {
  const subset = exports.all().filter((card) => validateRarity(card, rarity, baseIsCommon) && validateType(card, type));
  return random(subset);
};

function getClosest(needle = '', directory = []) {
  directory.forEach(card => card.name = translate(`card-name-${card.id}`, 1));
  directory.sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name));
  // TODO: allow *actual* fuzzy match
  needle = needle.toLowerCase();
  const card = directory.find(card => {
    const name = card.name.toLowerCase();
    return name === needle ||
      name.startsWith(needle) ||
      name.includes(needle);
  });
  if (card) { // Return a clone and translate some things
    normalMode();
    return {
      ...card,
      description: translate(`card-${card.id}`),
    };
  }
  return undefined;
}

function validateRarity({rarity: cardRarity = ''}, rarity = '', baseIsCommon = true) {
  switch(rarity.toLowerCase()) {
    case 'determination':
    case 'dt': return cardRarity === 'DETERMINATION';
    case 'legendary':
    case 'legend': return cardRarity === 'LEGENDARY';
    case 'epic': return cardRarity === 'EPIC';
    case 'rare': return cardRarity === 'RARE'
    case 'common': return cardRarity === 'COMMON' || baseIsCommon && cardRarity === 'BASE';
    case 'base': return cardRarity === 'BASE';
    case 'all':
    case 'any': return cardRarity !== 'TOKEN';
    default: return false;
  }
}

function validateType({extension: cardType = ''}, type = '') {
  switch(type.toLowerCase()) {
    case 'deltarune':
    case 'dr': return cardType === 'DELTARUNE';
    case 'base':
    case 'undertale':
    case 'ut': return cardType === 'BASE';
    case 'all':
    case 'any':
    case 'shiny':
    case 'mix': return true;
    default: return false;
  }
}
