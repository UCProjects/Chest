const Conf = require('conf');

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
    const type = card.shiny ? 's' : 'r';
    const key = `collection.${user.id}.${card.id}.${type}`;

    const value = config.get(key) || 0;
    const total = config.get(`${key}T`) || 0;
    
    set[key] = value + 1;
    set[`${key}T`] = total + 1;
  });

  config.set(set);
}

exports.get = function get(user = {
  id: 0,
}) {
  return config.get(`collection.${user.id || user}`);
}
