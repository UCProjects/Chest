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
  serialize: (data) => JSON.stringify(data),
});

class Count {
  constructor(value = 0, total = 0) {
    this.value = value;
    this.total = total;
  }
  increment() {
    this.value += 1;
    this.total += 1;
  }
  merge(other = new Count()) {
    this.value += other.value;
    this.total += other.total;
  }
  toString(simple = true) {
    return `${this.value}${simple ? '' : `/${this.total}`}`;
  }
}

class CardEntry {
  constructor({
    s: shiny = 0,
    r: regular = 0,
    sT: shinyTotal = 0,
    rT: regularTotal = 0,
  } = {}) {
    this.shiny = new Count(shiny, shinyTotal);
    this.regular = new Count(regular, regularTotal);
  }
  get total() {
    return this.shiny.total + this.regular.total;
  }
  toJSON() {
    const ret = {};
    if (this.shiny.value) {
      ret.s = this.shiny.value;
      ret.sT = this.shiny.total;
    }
    if (this.regular) {
      ret.r = this.regular.value;
      ret.rT = this.regular.total;
    }
    return ret;
  }
  merge(other = new CardEntry()) {
    this.shiny.merge(other.shiny);
    this.regular.merge(other.regular);
  }
  toString(simple = true) {
    const ret = [];
    if (this.shiny.value) {
      ret.push(`Shiny: ${this.shiny.toString(simple)}`);
    }
    if (this.regular.value) {
      ret.push(`Normal: ${this.regular.toString(simple)}`);
    }
    return ret.join('\n');
  }
}

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
