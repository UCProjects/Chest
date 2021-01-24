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
    return card
  }).then(image)
    .then((results) => msg.reply({
      embed: {
        image: {
          url: 'attachment://card.png',
        },
      }
    }, {
      name: 'card.png',
      file: results,
    }));
}

module.exports = new Command({
  title: '',
  alias: ['random', 'rand', 'rarity'],
  examples: [],
  usage: ['[rarity]'],
  description: 'Gets a random card',
  flags: [],
  disabled: (msg) => disabled(msg.guildID || msg.channel.guild.id, msg.channel.id),
  handler,
});
