const { artifacts, fetch } = require('../artifacts');
const Command = require('chat-commands/src/command');
const disabled = require('../disabled');
const { translate } = require('../lang');
const { simpleMode } = require('../lang/extend');
const paginator = require('../util/pagination');
const arrayChunk = require('../util/arrayChunk');

function handler(msg, args = [], flags = {}) {
  return fetch().catch((e) => {
    console.error(e);
    return '* Error retrieving artifacts';
  }).then((error) => {
    if (error) return error;
    simpleMode();
    const needle = args.join(' ').toLowerCase();
    if (!needle) return paginator(msg, arrayChunk([...artifacts.values()].map(({ id }) => translate(`artifact-name-${id}`))), {
      renderer(arts, page, total) {
        return {
          embed: {
            title: `Artifacts [${page}/${total}]`,
            description: arts.join('\n'),
          }
        };
      },
    });
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
  alias: ['artifact', 'art', 'a'],
  examples: [],
  usage: '',
  description: 'Look up artifact data',
  flags: [],
  disabled: (msg) => !process.env.UC_LOGIN || disabled(msg),
  handler,
});
