const undercards = require('./undercards');
const login = require('./util/login');

const delay = 60 * 1000; // hour
let next = Date.now();

const decks = new Map([[0, {
  id: 0,
  owner: {
    id: 0,
    username: '',
    avatar: { image: '' },
  },
  image: '',
  name: '',
  likes: 0,
  value: 0,
  date: new Date(),
  difficulty: '',
  archetype: '',
  data: {
    artifactIds: [0],
    cardIds: [0],
    soul: '',
  },
  code: '',
}]]);

decks.delete(0);

function fetch() {
  const password = process.env.UC_LOGIN;
  if (!password) return Promise.reject('No login');
  if (Date.now() < next) return Promise.resolve();
  return login(password)
    .then(Cookie => undercards.get('/HubDecksConfig', { headers: { Cookie }, params: { action: 'shop' } }))
    .then(({ data }) => {
      if (!data?.hubDecks) throw new Error('Missing hub data');
      next = Date.now() + delay;
      decks.clear();

      JSON.parse(data.hubDecks).forEach((deck) => {
        deck.date = new Date(deck.isoDate);
        deck.data = JSON.parse(Buffer.from(deck.code, 'base64').toString('utf8'));

        decks.set(deck.id, deck);
      });
    });
}

exports.fetch = fetch;
exports.rank = () => [...decks.values()].sort((a, b) => b.value - a.value);
exports.time = () => [...decks.values()].sort((a, b) => b.date - a.date);
