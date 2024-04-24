const { search } = require('fast-fuzzy');
const config = require('./config');
const undercards = require('./undercards');
const { translate, load } = require('./lang');
const { normalMode, simpleMode } = require('./lang/extend');
const random = require('./util/random');

const cards = new Map();

const day = 24 * 60 * 1000;
let next = Date.now();

function set(card) {
  cards.set(card.id, card);
}

config.get('cards', []).forEach(set);

exports.load = () => {
  if (Date.now() < next) return load();
  return Promise.all([undercards.get('/AllCards'), load()])
    .then(([{ data: { cards: newCards } }]) => {
      if (newCards) {
        cards.clear(); // Remove old cards
        const data = JSON.parse(newCards);
        data.forEach(set);
        config.set('cards', data);
      }
      next = Date.now() + day;
    }).catch(console.error);
};

exports.get = (name) => exports.load()
  .then(() => getClosest(name, [...cards.values()]));

exports.getSync = (name) => getClosest(name, [...cards.values()]);

exports.card = (id) => cards.get(id);
  
exports.all = () => [...cards.values()];

exports.info = () => ({
  size: cards.size,
  time: next,
});

exports.pick = (rarity = 'any', type = 'mix', baseIsCommon = true) => {
  const subset = exports.all().filter((card) => validateRarity(card, rarity, baseIsCommon) && validateType(card, type));
  return random(subset);
};

function getClosest(needle = '', directory = []) {
  simpleMode();
  const [card] = search(needle, directory, {
    keySelector: ({ id }) => translate(`card-name-${id}`, 1),
    threshold: 0.8,
  });
  if (card) { // Return a clone and translate some things
    normalMode();
    return {
      ...card,
      name: translate(`card-name-${card.id}`, 1),
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
