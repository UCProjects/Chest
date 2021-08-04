const Command = require('chat-commands/src/command');
const { all: allCards } = require('../cache');
const disabled = require('../disabled');
const { card: image } = require('../image');
const random = require('../util/random');
const { translate, load } = require('../lang');
const { normalMode } = require('../lang/extend');

function handler(msg, [filter] = [], flags = {}) {
  if (msg.command === 'rarity' && !filter) return '* Missing rarity';
  return load().then(() => {
    normalMode();
    const cards = filter ? allCards().filter(({ rarity }) => rarity.toLowerCase() === filter.toLowerCase()) : allCards();
    const card = random(cards);
    card.name = translate(`card-name-${card.id}`, 1);
    card.description = translate(`card-${card.id}`);
    return image(card);
  }).then((results) => ({
      embed: {
        image: {
          url: 'attachment://card.png',
        },
      },
      file: {
        name: 'card.png',
        file: results,
      },
    }));
}

module.exports = new Command({
  title: '',
  alias: ['random', 'rand', 'rarity'],
  examples: [],
  usage: '[rarity]',
  description: 'Gets a random card',
  flags: [],
  disabled,
  handler,
});
