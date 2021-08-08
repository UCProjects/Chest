const Command = require('chat-commands/src/command');
const disabled = require('../disabled');
const { translate } = require('../lang');
const { simpleMode } = require('../lang/extend');
const paginator = require('../util/pagination');
const arrayChunk = require('../util/arrayChunk');
const { CardEntry, get } = require('../collection');
const { load, card: getCard } = require('../cache');
const { generic: rarities, colors } = require('../util/rarities');

function handler(msg, [user = ''] = [], flags = {}) {
  const collection = {};
  const counts = {};
  const extensions = new Set();
  rarities.forEach((rarity) => {
    collection[rarity] = [];
  });
  
  function getCount(key) {
    if (!counts[key]) counts[key] = new CardEntry();
    return counts[key];
  }

  const searchUser = user.match(/<@\d+>/) ? user.substring(2, user.length - 1) : user;
  const activeUser = (msg.channel.guild && msg.channel.guild.members.get(searchUser)) || msg._client.users.get(searchUser) || msg.author;
  const isAuthor = activeUser.id === msg.author.id;
  const unknownUser = user && activeUser.id !== searchUser;
  const chest = unknownUser ? get(searchUser) : get(activeUser);

  return load().then(() => {
    const packs = Object.keys(chest).reduce((sum, id) => {
      const card = getCard(parseInt(id, 10));
      const entry = chest[id];
      if (!card) {
        console.log('Missing card:', id)
        return sum;
      }
      const { rarity, extension } = card;

      collection[rarity].push({
        ...card,
        // name: translate(`card-name-${card.id}`, 1),
        // description: translate(`card-${card.id}`),
        counts: entry,
      });
      getCount(rarity).merge(entry);
      getCount(extension).merge(entry);
      extensions.add(extension);
      return sum + entry.total;
    }, 0) / 4;

    const arr = [''];
    rarities.forEach((rarity) => {
      arr.push(...arrayChunk(collection[rarity], 9));
    });
    return paginator(msg, arr, {
      renderer(data, page, total) {
        simpleMode();
        const fields = [{
          name: '',
          value: '',
          inline: true,
        }];
        const user = unknownUser ? `*${searchUser}*` : (!isAuthor ? activeUser.mention : '');
        const embed = {
          title: translate('decks-your-collection'),
          description: user ? `User: ${user}\n` : '',
          color: colors.BASE,
          fields,
        };
        fields.shift();
        if (page === 1) {
          rarities.forEach((rarity) => {
            const entry = getCount(rarity);
            if (!entry.total) return;
            fields.push({
              name: `${translate(`rarity-${rarity.toLowerCase()}`)} (${entry.total})`,
              value: `${entry}`,
              inline: true,
            });
          });
          if (fields.length) {
            fields.push({
              name: '----------',
              value: 'Types:',
            });
          }
          [...extensions.values()].forEach((extension) => {
            const entry = getCount(extension);
            if (!entry.total) return;
            fields.push({
              name: `${extension === 'BASE' ? 'UNDERTALE' : extension} (${entry.total})`,
              value: `${entry}`,
              inline: true,
            });
          });
          if (!fields.length) {
            embed.description += '* No collection yet! Open a `pack` to get started.\n';
          }
        } else {
          const { rarity } = data[0];
          embed.title += `: ${rarity} [${page - 1}/${total - 1}]`;
          embed.color = colors[rarity];
          data.forEach((card) => {
            const { id, counts } = card;
            fields.push({
              name: translate(`card-name-${id}`, 1),
              value: `${counts}`,
              inline: true,
            })
          });
        }
        if (!fields.length) delete embed.fields;
        else embed.description += `Packs: ${packs}\n`;
        return { embed };
      }
    });
  });
}

module.exports = new Command({
  title: 'Your collection',
  alias: ['collection', 'chest'],
  examples: [
    '`<command>` - view your collection',
    '`<command> @user` - view User\'s collection',
    '`<command> 123456789` - view User\'s collection',
  ],
  usage: '[user]',
  description: 'Shows your pack collection\n\n* `Final`, `Super` and `Shiny` packs do not add cards to the collection.',
  flags: [],
  disabled,
  handler,
});

