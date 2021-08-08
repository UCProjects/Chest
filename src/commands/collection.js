const Command = require('chat-commands/src/command');
const disabled = require('../disabled');
const { translate } = require('../lang');
const { simpleMode } = require('../lang/extend');
const paginator = require('../util/pagination');
const arrayChunk = require('../util/arrayChunk');
const { get } = require('../collection');
const { load, card: getCard } = require('../cache');
const { generic: rarities, colors } = require('../util/rarities');

const subtotals = {
  total: 0,
  regular: 0,
  shiny: 0,
};

function handler(msg, args = [], flags = {}) {
  const collection = {};
  const counts = {};
  rarities.forEach((rarity) => {
    collection[rarity] = [];
    counts[rarity] = { ...subtotals };
  });

  const chest = get(msg.author);

  return load().then(() => {
    Object.keys(chest).forEach((id) => {
      const card = getCard(parseInt(id, 10));
      if (!card) return console.log('Missing card:', id);
      const { rarity } = card;
      const { r: regular = 0, s: shiny = 0 } = chest[id];

      collection[rarity].push({
        ...card,
        name: translate(`card-name-${card.id}`, 1),
        //description: translate(`card-${card.id}`),
        counts: {
          regular,
          shiny,
        },
      });
      counts[rarity].regular += regular;
      counts[rarity].shiny += shiny;
      counts[rarity].total += regular + shiny;
    });

    const arr = [''];
    rarities.forEach((rarity) => {
      arr.push(...arrayChunk(collection[rarity], 9));
    });
    return paginator(msg, arr, {
      renderer(data, page, total) {
        const fields = [{
          name: '',
          value: '',
          inline: true,
        }];
        const embed = {
          title: translate('decks-your-collection'),  
          color: colors.BASE,
          fields,
        };
        fields.shift();
        if (page === 1) {
          rarities.forEach((rarity) => {
            const { total, regular, shiny } = counts[rarity];
            if (!total) return;
            fields.push({
              name: `${translate(`rarity-${rarity.toLowerCase()}`)} (${total})`,
              value: getText(shiny, regular),
              inline: true,
            });
          });
          if (!fields.length) {
            embed.description = '* No collection yet! Open some packs to get started.';
          }
        } else {
          const { rarity } = data[0];
          embed.title += `: ${rarity} [${page - 1}/${total - 1}]`;
          embed.color = colors[rarity];
          data.forEach((card) => {
            const { name, counts: { shiny, regular } } = card;
            fields.push({
              name: name,
              value: getText(shiny, regular),
              inline: true,
            })
          });
        }
        if (!fields.length) delete embed.fields;
        return { embed };
      }
    });
  });
}

function getText(shiny, normal) {
  const ret = [];
  if (shiny) {
    ret.push(`Shiny: ${shiny}`);
  }
  if (normal) {
    ret.push(`Normal: ${normal}`);
  }
  return ret.join('\n');
}

module.exports = new Command({
  title: 'Your collection',
  alias: ['collection', 'chest'],
  examples: [],
  usage: '',
  description: 'Shows your pack collection.\n\n* `Final`, `Super` and `Shiny` packs do not add cards to the collection',
  flags: [],
  disabled,
  handler,
});

