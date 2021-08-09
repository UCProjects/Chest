const Entry = require('../src/util/cardEntry');
const random = require('../src/util/randomNumber');
const { generic: rarities } = require('../src/util/rarities');

class Results {
  constructor() {
    this.COMMON = new Entry();
    this.RARE = new Entry();
    this.EPIC = new Entry();
    this.LEGENDARY = new Entry();
    this.DETERMINATION = new Entry();
  }
}

function rates({
  DETERMINATION = 1,
  LEGENDARY = 50,
  EPIC = 200,
  RARE = 1000,
  count = 40000,
} = {}) {
  const needle = random(count);
  if (needle < DETERMINATION) {
    return 'DETERMINATION';
  } else if (needle < LEGENDARY) {
    return 'LEGENDARY';
  } else if (needle < EPIC) {
    return 'EPIC';
  } else if (needle < RARE) {
    return 'RARE';
  }
  return 'COMMON';
}

const tests = [{
  name: 'Previous', // Averages about 0.15%
  DETERMINATION: 3,
  LEGENDARY: 50,
  EPIC: 200,
  RARE: 1000,
  count: 10000,
  packs: 10000,
}, {
  name: 'New', // Averages about 0.01%
  DETERMINATION: 1,
  packs: 10000,
}, {
  name: 'New - 100k',
  DETERMINATION: 1,
  count: 40000,
  packs: 100000,
}, {
  name: 'New - 1m',
  DETERMINATION: 1,
  count: 40000,
  packs: 1000000,
}];

describe('rates.js', () => {
  tests.forEach((test) => {
    describe(test.name, () => {
      const results = new Results();
      const trials = test.packs * 4;
      for(let i = 0; i < trials; i++) {
        results[rates(test)].regular.increment();
      }
      console.log(test.name);
      rarities.forEach((rarity) => {
        const total = results[rarity].total;
        console.log(rarity, total, 100 * total / test.packs);
      });
    })
  });
});
