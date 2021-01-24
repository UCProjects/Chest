const { artifacts, fetch } = require('../artifacts');
const Command = require('chat-commands/src/command');
const disabled = require('../disabled');
const { translate } = require('../lang');
const { simpleMode } = require('../lang/extend');

function handler(msg, args = [], flags = {}) {
  return fetch().catch((e) => {
    console.error(e);
    return '* Error retreiving artifacts';
  }).then((error) => {
    if (error) return error;
    simpleMode();
    const needle = args.join(' ').toLowerCase();
    if (!needle) return {
      embed: {
        title: 'Artifacts',
        description: [...artifacts.values()]
          .map(({ id }) => translate(`artifact-name-${id}`))
          .join(', '),
      }
    };
    const { id, cost, legendary, image, unavailable } = [...artifacts.values()]
      .find(({ name }) => name.toLowerCase() === needle) || {};
    if (!id) return `* ${args.join(' ')} not found`;
    const fields = [{
      name: 'Type',
      value: translate(`artifacts-${legendary ? 'legendary' : 'normal'}`),
      inline: true,
    }];
    if (!unavailable) {
      fields.push({
        name: 'Cost',
        value: `${cost} G`,
        inline: true,
      });
    }
    return {
      embed: {
        title: translate(`artifact-name-${id}`),
        description: translate(`artifact-${id}`),
        color: legendary ? 16766720 : 15987699,
        fields,
        thumbnail: {
          url: `https://undercards.net/images/artifacts/${image}.png`,
          width: 32,
          height: 32,
        },
      },
    };
  });
}

module.exports = new Command({
  title: '',
  alias: ['artifact', 'art'],
  examples: [],
  usage: [],
  description: 'Look up artifact data',
  flags: [],
  disabled: (msg) => disabled(msg.guildID || msg.channel.guild.id, msg.channel.id),
  handler,
});
