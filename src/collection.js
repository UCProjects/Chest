const Conf = require('conf');
const CardEntry = require('./util/cardEntry');

const config = new Conf({
  configName: 'collection',
  schema: {
    collection: {
      type: 'object',
      description: 'Parent object for `conf` to work',
      patternProperties: {
        '^\\d+$': {
          type: 'object',
          description: 'user id',
          patternProperties: {
            '^\\d+$': {
              type: 'object',
              description: 'card id',
              properties: {
                r: { type: 'integer' },
                s: { type: 'integer' },
                rT: { type: 'integer' },
                sT: { type: 'integer' },
              },
            },
          },
        }
      },
    },
  },
  serialize: (data) => JSON.stringify(data),
});

exports.add = function add(user = {
  id: 0,
}, cards = [{
  id: 0,
  shiny: false,
}]) {
  if (!cards.length) return;

  const set = {};
  // Add to collection
  cards.forEach((card) => {
    const key = `collection.${user.id}.${card.id}`;
    const value = set[key] || new CardEntry(config.get(key));
    if (!set[key]) set[key] = value;

    const type = card.shiny ? 'shiny' : 'regular';
    value[type].increment();
  });

  config.set(set);
}

exports.get = function get(user = {
  id: 0,
}) {
  const data = config.get(`collection.${user.id || user}`, {});
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, new CardEntry(v)]));
}

exports.CardEntry = CardEntry;
