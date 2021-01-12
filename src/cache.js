const { default: axios } = require("axios");
const { translate, load } = require('./lang');

const undercards = axios.create({
  baseURL: 'https://undercards.net',
});

const cards = new Map();

const day = 24 * 60 * 1000;
let next = Date.now();

exports.load = () => {
  if (Date.now() < next) return Promise.resolve();
  return Promise.all([undercards.get('/AllCards'), undercards.get('https://undercards.net/translation/en.json')])
    .then(([{ data: { cards: newCards } }, { data: lang }]) => {
      if (lang) load(lang);
      if (newCards) {
        cards.clear(); // Remove old cards
        JSON.parse(newCards).forEach(card => cards.set(card.id, card));
      }
      next = Date.now() + day;
    }).catch(console.error);
};

exports.get = (name) => exports.load()
  .then(() => getClosest(name, [...cards.values()]));

exports.all = () => [...cards.values()];

function getClosest(needle = '', directory = []) {
  directory.forEach(card => card.name = translate(`card-name-${card.id}`, 1))
  directory.sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name));
  // TODO: allow *actual* fuzzy match
  const card = directory.find(card => card.name.toLowerCase() === needle.toLowerCase()) ||
    directory.find(card => card.name.toLowerCase().startsWith(needle.toLowerCase())) || 
    directory.find(card => card.name.toLowerCase().includes(needle.toLowerCase()));
  if (card) { // Return a clone and translate some things
    return {
      ...card,
      name: translate(`card-name-${card.id}`, 1),
      description: translate(`card-${card.id}`),
    };
  }
  return undefined;
}
