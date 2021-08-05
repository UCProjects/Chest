const randomNumber = require('./randomNumber');

// Pagination. Listens to emotes/ and unregisters after X time. Register fixed data sets, and a renderer.
const actions = ['⏮️', '⬅️', '➡️', '⏭️'];
const RANDOM = '🔀';
const events = ['messageReactionAdd', 'messageReactionRemove'];
const minute = 60000;
module.exports = async (msg, data = [], {
  renderer = (data, current, total, ...args) => '',
  timeout = 60,
  page = 1,
  args = [],
  navButtons = true,
  randomButton = false,
}) => {
  if (!Array.isArray(data)) return;
  timeout = Math.max(Math.min(timeout, 1440), 5); // 5m-1d
  if (!page || Number.isNaN(page)) { // Random
    page = randomNumber(data.length);
  } else { // 0-max
    page = Math.max(Math.min(page, data.length), 1) - 1;
  }
  function render() {
    return Promise.resolve().then(() => renderer(data[page], page + 1, data.length, ...args));
  }
  const connection = msg.connection;
  return msg.reply(await render())
    .then((message) => {
      if (data.length) {
        addEmotes(message, {
          nav: navButtons,
          random: randomButton,
          jump: navButtons && data.length > 2,
        });
        async function listener(response, emoji, user) {
          if ((user.id || user) === connection.user.id || response.id !== message.id) return;
          emoji = emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name;
          const currentPage = page;
          switch(emoji) {
            case '⏮️':
              page = 0; 
              break;
            case '⬅️':
              page = Math.max(0, page - 1);
              break;
            case '➡️':
              page = Math.min(data.length - 1, page + 1);
              break;
            case '⏭️':
              page = data.length - 1;
              break;
            case RANDOM:
              do {
                page = randomNumber(data.length);
              } while (page > 1 && page === currentPage);
              break;
            default: return;
          }
          if (page === currentPage) return;
          message.edit(await render());
        }
        events.forEach(ev => connection.on(ev, listener));
        setTimeout(() => events.forEach(ev => connection.off(ev, listener)), timeout * minute);
      }

      return message;
    });
};

function addEmotes(message, {
  nav = true,
  random = false,
  jump = false,
}) {
  if (nav) actions.forEach(a => (jump || ['⬅️', '➡️'].includes(a)) && message.addReaction(a));
  if (random) message.addReaction(RANDOM);
}
