const undercards = require('./undercards');
const { translate, load } = require('./lang');
const { normalMode } = require('./lang/extend');

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

exports.card = (id) => exports.load()
  .then(cards.get(id));
  
exports.all = () => [...cards.values()];

function getClosest(needle = '', directory = []) {
  directory.forEach(card => card.name = translate(`card-name-${card.id}`, 1))
  directory.sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name));
  // TODO: allow *actual* fuzzy match
  const card = directory.find(card => card.name.toLowerCase() === needle.toLowerCase()) ||
    directory.find(card => card.name.toLowerCase().startsWith(needle.toLowerCase())) || 
    directory.find(card => card.name.toLowerCase().includes(needle.toLowerCase()));
  if (card) { // Return a clone and translate some things
    normalMode();
    return {
      ...card,
      description: translate(`card-${card.id}`),
    };
  }
  return undefined;
}
