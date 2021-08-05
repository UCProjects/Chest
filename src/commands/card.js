const Command = require('chat-commands/src/command');
const cache = require('../cache');
const { card: image } = require('../image');
const disabled = require('../disabled');

function handler(msg, args = [], flags = {}) {
  const cardName = args.join(' ');
  if (!cardName.trim()) return '* No card name provided';
  // Lookup and return card
  return cache.get(cardName.trim())
    .then((card) => {
      if (card) {
        return image(card);
      } else {
        return `* Card \`${cardName}\` not found`
      }
    }).then((results) => {
      if (results instanceof Buffer) {
        return {
          embed: {
            image: {
              url: 'attachment://card.png',
            },
          },
          file: {
            name: 'card.png',
            file: results,
          },
        };
      }
      return results;
    });
}

module.exports = new Command({
  title: '',
  alias: ['card', 'c', 'check', 'lookup'],
  examples: [],
  usage: '<card name>',
  description: 'Look up card data',
  flags: [],
  disabled,
  handler,
});
