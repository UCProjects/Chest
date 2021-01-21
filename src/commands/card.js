const Command = require('chat-commands/src/command');
const Configstore = require('configstore');
const cache = require('../cache');
const image = require('../image');

const config = new Configstore('robot-98');

function disabled(guildID, channelID) {
  const prefix = `discord.${guildID}`;
  return config.has(`${prefix}.blacklist.${channelID}`) || // Is on the black list OR
    config.has(`${prefix}.whitelist`) && // Has a whitelist BUT
    !config.has(`${prefix}.whitelist.${channelID}`); // is not on the whitelist
}

function handler(msg, args = [], flags = {}) {
  if (disabled(msg.guildID || msg.channel.guild.id, msg.channel.id)) {
    console.debug('Commands disabled on channel');
    return;
  }
  const cardName = args.join(' ');
  if (!cardName.trim()) return '* No name provided';
  // Lookup and return card
  return cache.get(cardName.trim())
    .then((card) => {
      if (card) {
        return image(card);
      } else {
        return `* ${cardName} not found`
      }
    })
    .then((results) => {
      if (results instanceof Buffer) {
        return msg.reply({
          embed: {
            image: {
              url: 'attachment://card.png',
            },
            footer: {
              // text: 'Sponsored by: Your name here!',
            },
          }
        }, {
          name: 'card.png',
          file: results,
        });
      }
      return results;
    });
}

module.exports = new Command({
  title: '',
  alias: ['card', 'c', 'check', 'lookup'],
  examples: [],
  usage: ['<card name>'],
  description: 'Look up card data',
  flags: [],
  handler,
});
