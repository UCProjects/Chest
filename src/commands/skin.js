const Command = require('chat-commands/src/command');
const { fetch, skins, artists } = require('../skins');
const { get } = require('../cache');
const disabled = require('../disabled');

function handler(msg, args = [], flags = {}) {
  return fetch().catch((e) => {
    console.error(e);
    return '* Error retrieving skins';
  }).then((error) => {
    if (error) return error;
    const needle = args.join(' ').toLowerCase();
    if (!needle) {
      if (msg.command.toLowerCase().startsWith('artist')) return {
        embed: {
          title: `Artists (${artists.size})`,
          description: `- ${[...artists.keys()].join('\n- ')}`,
        },
      };
      const skin = [...skins.values()][Math.floor(Math.random() * skins.size)];
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

function getSafeLength(text = '', length = 2048, splitter = ',') {
  let len = text.length;
  while (len > length) {
    len = text.lastIndexOf(splitter) - 1;
  }
  return len;
}

module.exports = new Command({
  title: '',
  alias: ['skin', 'skins', 'artist', 'artists'],
  examples: [],
  usage: '[skin|artist|card]',
  description: 'Look up skins for a card or artist',
  flags: [],
  disabled: (msg) => disabled(msg.guildID || msg.channel.guild.id, msg.channel.id),
  handler,
});
