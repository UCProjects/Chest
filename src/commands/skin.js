const Command = require('chat-commands/src/command');
const { fetch, skins, artists } = require('../skins');
const { get } = require('../cache');
const getSafeLength = require('../util/safeLength');
const disabled = require('../disabled');
const random = require('../util/random');

function handler(msg, args = [], flags = {}) {
  return fetch().catch((e) => {
    console.error(e);
    return '* Error retrieving skins';
  }).then((error) => {
    if (error) return error;
    const needle = args.join(' ').toLowerCase();
    if (!needle) {
      if (msg.command.toLowerCase().startsWith('artist')) {
        const description = [...artists.keys()].join(', ');
        return {
          embed: {
            title: `Artists (${artists.size})`,
            description: description.substring(0, getSafeLength(description)),
          },
        };
      }
      const skin = random([...skins.values()]);
      return {
        embed: {
          title: `Skins (${skins.size})`,
          description: skin.name,
          fields: [{
            name: 'Card',
            value: skin.cardName,
            inline: true,
          }, {
            name: 'Cost',
            value: `${skin.ucpCost} UCP${skin.unavailable ? ' (not for sale)' : ''}`,
            inline: true,
          }, {
            name: 'Artist',
            value: skin.authorName,
          }],
          image: {
            url: `https://undercards.net/images/cards/${skin.image}.png`,
          }
        },
      };
    }
    const artist = [...artists.keys()].find(name => name.toLowerCase() === needle || name.toLowerCase().startsWith(needle));
    if (artist) {
      const works = artists.get(artist);
      const description = works.map(entry => entry.name).join(', ');
      return {
        embed: {
          title: `${artist} skins (${works.length})`,
          description: description.substring(0, getSafeLength(description)),
        }
      };
    } else if (msg.command.toLowerCase().startsWith('artist')) {
      return `* Artist \`${args.join(' ')}\` not found`;
    }
    const skin = [...skins.values()].find(({ name }) => name.toLowerCase() === needle);
    if (skin) {
      return {
        embed: {
          title: skin.name,
          fields: [{
            name: 'Card',
            value: skin.cardName,
            inline: true,
          }, {
            name: 'Cost',
            value: `${skin.ucpCost} UCP${skin.unavailable ? ' (not for sale)' : ''}`,
            inline: true,
          }, {
            name: 'Artist',
            value: skin.authorName,
          }],
          image: {
            url: `https://undercards.net/images/cards/${skin.image}.png`,
          },
        },
      };
    }
    return get(needle).then((card) => {
      if (!card) return `* Skin \`${args.join(' ')}\` not found`;
      const works = [...skins.values()].filter(skin => skin.cardId === card.id);
      const description = works.map(entry => entry.name).join(', ');
      return {
        embed: {
          title: `${card.name} Skins (${works.length})`,
          description: description.substring(0, getSafeLength(description)),
        },
      };
    });
  });
}

module.exports = new Command({
  title: '',
  alias: ['skin', 'skins', 'artist', 'artists'],
  examples: [],
  usage: '[skin|artist|card]',
  description: 'Look up skins for a card or artist',
  flags: [],
  disabled: (msg) => !process.env.UC_LOGIN || disabled(msg),
  handler,
});
