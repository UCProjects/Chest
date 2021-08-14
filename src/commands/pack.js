const Command = require('chat-commands/src/command');
const disabled = require('../disabled');
const { pack: image } = require('../image');
const { load, pick } = require('../cache');
const { normalMode } = require('../lang/extend');
const random = require('../util/randomNumber');
const { translate } = require('../lang');
const { add: addCards } = require('../collection');
const { super: legendary, final } = require('../util/rarities');
const userQueue = require('../util/userQueue');

const queue = userQueue(5);
function limiter(msg, ...rest) {
  return queue(msg.author, handler.bind(this, msg, ...rest));
}

// Basically a crippled version of draftbot
function rates() {
  const needle = random(40000);
  if (needle < 1) {
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

function build(msg, type = 'ut', size = 4) {
  const pack = [];
  if (typeof type !== 'string') return pack;
  let shiny = false;
  let collect = false;
  switch (type.toLowerCase()) {
    case 'common':
    case 'rare':
    case 'epic':
    case 'legendary':
    case 'legend':
    case 'super':
      legendary.forEach((rarity) => {
        pack.push(pick(rarity, 'mix', false));
      });
      break;
    case 'dt':
    case 'determination':
    case 'final':
      final.forEach((rarity) => {
        pack.push(pick(rarity, 'mix', false));
      });
      break;
    case 'shiny':
      shiny = true;
    default:
      collect = !shiny;
      for (let i = 0, l = size * 5; pack.length < size && i < l; i++) { // Run up to 5x the pack size to meet the pack size limit
        const card = pick(rates(), type, false);
        if (card) {
          card.shiny = shiny || random(100) < 5;
          pack.push(card);
        }
      }
  }
  if (collect) {
    addCards(msg.author, pack);
  }
  return pack;
}

function handler(msg, args = [], flags = {}) {
  return load().then(() => {
    const pack = build(msg, flags.type || args[0]);
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
    description: '`UT` (default), `DR`, `mix` (both), `Shiny`, `Super`, `Final`',
  }],
  handler: limiter,
  disabled,
});
