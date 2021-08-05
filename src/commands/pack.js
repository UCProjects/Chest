const Command = require('chat-commands/src/command');
const disabled = require('../disabled');
const { pack: image } = require('../image');
const { load, pick } = require('../cache');
const { normalMode } = require('../lang/extend');
const random = require('../util/randomNumber');
const { translate } = require('../lang');

// Basically a crippled version of draftbot
function rates() {
  const needle = random(10000);
  if (needle < 3) {
    return 'determination';
  } else if (needle < 50) {
    return 'legendary';
  } else if (needle < 200) {
    return 'epic';
  } else if (needle < 1000) {
    return 'rare';
  }
  return 'common';
}

function build(type = 'ut', size = 4) {
  const pack = [];
  if (typeof type !== 'string') return pack;
  switch (type.toLowerCase()) {
    case 'common':
    case 'rare':
    case 'epic':
    case 'legendary':
    case 'legend':
    case 'super':
      ['common', 'rare', 'epic', 'legendary'].forEach((rarity) => {
        pack.push(pick(rarity, 'mix', false));
      });
      break;
    case 'dt':
    case 'determination':
    case 'final':
      ['rare', 'epic', 'legendary', 'determination'].forEach((rarity) => {
        pack.push(pick(rarity, 'mix', false));
      });
      break;
    default: 
      for (let i = 0, l = size * 5; pack.length < size && i < l; i++) { // Run up to 5x the pack size to meet the pack size limit
        const card = pick(rates(), type, false);
        if (card) {
          pack.push(card);
        }
      }
  }
  return pack;
}

function handler(msg, args = [], flags = {}) {
  return load().then(() => {
    const pack = build(flags.type || args[0]);
    if (!pack.length) return `Invalid type: ${flags.type}`;
    normalMode();
    pack.forEach((card) => {
      card.name = translate(`card-name-${card.id}`, 1);
      card.description = translate(`card-${card.id}`);
    });
    return image(pack);
  }).then((result) => {
    if (result instanceof Buffer) {
      return {
        embed: {
          image: {
            url: 'attachment://pack.png',
          },
        },
        message_reference: {
          message_id: msg.id,
        },
        file: {
          name: 'pack.png',
          file: result,
        },
      };
    }
    return result;
  });
}


module.exports = new Command({
  title: '',
  alias: ['pack', 'open'],
  examples: [],
  usage: '[type]',
  description: 'Simulate an undercards pack opening',
  flags: [{
    alias: ['type'],
    usage: 'mix',
    description: '`UT` (default), `DR`, or `mix` (both), `Super`, `Final`',
  }],
  handler,
  disabled,
});
