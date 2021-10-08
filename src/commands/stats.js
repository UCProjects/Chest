const bytes = require('bytes');
const Command = require('chat-commands/src/command');
const pm2 = require('pm2');
const disabled = require('../disabled');
const timespan = require('../util/timespan');

const { pm_id: PROCESS } = process.env;

function handler(msg) {
  return new Promise((res, rej) => {
    if (!PROCESS) {
      res([]);
      return;
    }
    pm2.describe(PROCESS, (err, data) => {
      if (err) rej(err);
      else res(data);
    })
  }).then(([data]) => {
    const fields = [{
      name: 'Uptime',
      value: timespan(process.uptime() * 1000),
      inline: true,
    }];
    if (data) {
      const {
        monit: {
          memory = 0,
          cpu = 0.0,
        },
      } = data;
      fields.push({
        name: 'CPU Usage',
        value: `${cpu}%`,
        inline: true,
      }, {
        name: 'RAM Usage',
        value: bytes(memory, { thousandsSeparator: ',' }),
        inline: true,
      });
    }
    fields.push({
      name: 'Guilds',
      value: msg.connection.guilds.size,
      inline: true,
    });
    return {
      embed: {
        title: 'Chest',
        fields,
      },
    };
  });
}

module.exports = new Command({
  title: '',
  alias: ['stats'],
  examples: [],
  usage: '',
  description: '',
  flags: [],
  handler,
  disabled,
});
