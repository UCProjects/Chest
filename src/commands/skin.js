const Command = require('chat-commands/src/command');
const { fetch, skins, artists } = require('../skins');
const { get } = require('../cache');
const disabled = require('../disabled');
const random = require('../util/random');
const paginator = require('../util/pagination');
const chunker = require('../util/arrayChunk');

function handler(msg, args = [], flags = {}) {
  return fetch().catch((e) => {
    console.error(e);
    return '* Error retrieving skins';
  }).then((error) => {
    if (error) return error;
    const needle = args.join(' ').toLowerCase();
    if (!needle) {
      if (msg.command.toLowerCase().startsWith('artist')) {
        return paginator(msg, chunker([...artists.keys()]), {
          renderer(data, page, total) {
            return {
              embed: {
                title: `Artists (${artists.size}) [${page}/${total}]`,
                description: data.join('\n'),
              },
            };
          },
        });
      }
      const skin = random([...skins.values()]);
      return {
        embed: {
          title: `Skins (${skins.size})`,
          description: skin.name,
          ...embedSkin(skin),
        },
      };
    }
    const artist = [...artists.keys()].find(name => name.toLowerCase() === needle || name.toLowerCase().startsWith(needle));
    if (artist) {
      const works = artists.get(artist);
      return paginator(msg, [...works], {
        renderer(skin, page, total) {
          return {
            embed: {
              title: `${artist} skins (${page}/${total})`,
              description: skin.name,
              ...embedSkin(skin),
            },
          };
        },
      });
    } else if (msg.command.toLowerCase().startsWith('artist')) {
      return `* Artist \`${args.join(' ')}\` not found`;
    }
    const skin = [...skins.values()].find(({ name }) => name.toLowerCase() === needle);
    if (skin) {
      return {
        embed: {
          title: skin.name,
          ...embedSkin(skin),
        },
      };
    }
    return get(needle).then((card) => {
      if (!card) return `* Skin \`${args.join(' ')}\` not found`;
      const works = [...skins.values()].filter(skin => skin.cardId === card.id);
      return paginator(msg, [...works], {
        renderer(skin, page, total) {
          return {
            embed: {
              title: `${card.name} skins (${page}/${total})`,
              description: skin.name,
              ...embedSkin(skin),
            },
          };
        },
        randomButton: works.length > 10,
      });
    });
  });
}

function embedSkin(skin) {
  return {
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
  };
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
