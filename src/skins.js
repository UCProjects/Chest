const config = require('./config');
const undercards = require('./undercards');
const login = require('./util/login');

const day = 24 * 60 * 1000;
let next = Date.now();

const skins = new Map();
const artists = new Map([['', []]]);

function set(skin) {
  skins.set(skin.id, skin);
    const artist = skin.authorName;
    const works = artists.get(artist) || [];
    // Doesn't exist? Add it
    if (!works.length) artists.set(artist, works);
    works.push(skin);
}

config.get('skins', []).forEach(set);

function fetch() {
  const password = process.env.UC_LOGIN;
  if (!password) return Promise.reject('No login');
  if (Date.now() < next) return Promise.resolve();
  return login(password)
    .then(Cookie => undercards.get('/CardSkinsConfig', { headers: { Cookie }, params: { action: 'shop' } }))
    .then(({ data }) => {
      if (!data) throw new Error('Missing skin data');
      skins.clear();
      artists.clear();
      next = Date.now() + day;

      const skinData = JSON.parse(data.cardSkins);
      skinData.forEach((skin) => {
        skins.set(skin.id, skin);
        const artist = skin.authorName;
        const works = artists.get(artist) || [];
        // Doesn't exist? Add it
        if (!works.length) artists.set(artist, works);
        works.push(skin);
      });
      config.set('skins', skinData);
    });
}

exports.fetch = fetch;
exports.skins = skins;
exports.artists = artists;