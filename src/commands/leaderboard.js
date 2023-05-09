const Command = require('chat-commands/src/command');
const Configstore = require('configstore');
const disabled = require('../disabled');
const floor = require('../util/floor');
const { translate } = require('../lang');
const undercards = require('../undercards');
const paginator = require('../util/pagination');
const arrayChunk = require('../util/arrayChunk');

const config = new Configstore('robot-98');

const userdata = {
  id: 0,
  username: '',
  usernameSafe: '',
  avatar: {
    image: '',
  },
  level: 0,
  winsRanked: 0,
  lossesRanked: 0,
  division: '',
  eloRanked: 0,
  winStreak: 0,
  rank: 0, // Custom value
};

function handler(msg, args = [], flags = {}) {
  const needle = args.join('').toLowerCase();
  return undercards.get('/Leaderboard', { params: { action: 'ranked' } })
    .then(({ data }) => JSON.parse(data.leaderboard))
    .then((leaderboard) => {
      leaderboard.forEach((e, i) => e.rank = i); // Set rank
      const register = this.flag('register', flags);
      const me = ['me', 'main'].includes(needle);
      if (register || this.flag('unregister', flags)) {
        if (needle) {
          const path = `leaderboard.${msg.author.id}`;
          const entries = config.get(path) || {};
          if (me) {
            return getRegistered(leaderboard, entries, { msg });
          }
          const user = findUser(leaderboard, needle);
          if (!user) return `* User \`${args.join(' ')}\` not found on leaderboard`;
          if (register) {
            entries[user.id] = user.username;
            if (this.flag('main', flags)) {
              entries.main = user.id;
            }
            config.set(path, entries);
            return `Registered ${user.username}`;
          } else {
            if (entries[user.id]) {
              delete entries[user.id];
              if (entries.main === user.id) {
                delete entries.main;
              }
              config.set(path, entries);
              return `Deleted ${user.username}`;
            } else {
              return '* User not set';
            }
          }
        } else {
          return '* No username provided';
        }
      }
      if (me) {
        const entries = config.get(`leaderboard.${msg.author.id}`);
        return getRegistered(leaderboard, entries, { main: this.flag('main', flags), msg });
      } else if (needle) {
        return singleResult(findUser(leaderboard, needle)) ||
          `* User \`${args.join(' ')}\` not found`;
      } else {
        const page = !flags.page || Number.isNaN(flags.page) ? 1 : flags.page;
        return multiResult(arrayChunk(leaderboard), undefined, msg, page);
      }
    });
}

function getRegistered(leaderboard = [userdata], entries = {}, {
  main = false,
  msg,
} = {}) {
  const prefix = msg.prefix === msg.mention ? '@me ' : msg.prefix;
  if (main) {
    return singleResult(findUser(leaderboard, entries.main)) || {
        embed: {
          description: [
            `* ${entries.main ? 'Main not found' : 'No main registered'}`,
            `Use \`${${prefix}}!${msg.command} Username --register --main\` to register`,
          ].join('\n'),
        }
      };
  }
  const users = Object.keys(entries)
    .filter(_ => _ !== 'main')
    .map(id => findUser(leaderboard, id))
    .filter(_ => _);
  if (users.length === 1) return singleResult(users[0]);
  users.sort((a, b) => a.rank - b.rank);
  return multiResult([...arrayChunk(users), ...users], 'Registered users', msg, 1, [
    '* None',
    `Use \`${prefix}!${msg.command} Username --register\` to register`,
  ].join('\n'));
}

function findUser(leaderboard = [userdata], needle) {
  return leaderboard.find(e => e.usernameSafe === needle) ||
    leaderboard.find(e => e.id == needle);
}

function singleResult(entry = userdata) {
  if (entry === userdata) return false;
  const {
    winsRanked: wins,
    lossesRanked: losses,
    division,
    eloRanked: elo,
  } = entry;
  return {
    embed: {
      author: {
        name: entry.username,
        icon_url: `https://undercards.net/images/avatars/${entry.avatar.image}.png`,
      },
      description: [
        `**${translate('leaderboard-rank')}**: ${entry.rank + 1}`,
        `**${translate('stat-lv')}**: ${entry.level}`,
        `**ID**: ${entry.id}`,
      ].join('\n'),
      fields: [{
        name: translate('leaderboard-division'),
        value: translate(`{{DIVISION:${division}}}`),
        inline: true,
      }, {
        name: translate('leaderboard-progress'),
        value: `${elo}${division !== 'LEGEND' ? ` (${floor((elo % 25) / 25 * 100)}%)` : ''}`,
        inline: true,
      }, {
        name: '------',
        value: 'Stats',
      }, {
        name: translate('leaderboard-w'),
        value: wins,
        inline: true,
      }, {
        name: translate('leaderboard-l'),
        value: losses,
        inline: true,
      }, {
        name: translate('leaderboard-ws'),
        value: entry.winStreak,
        inline: true,
      }, {
        name: 'WR',
        value: `${floor(wins / (wins + losses) * 100)}%`,
        inline: true,
      }],
    },
  };
}
function multiResult(entries = [], title, msg, page = 1, emptyMessage = '* None') {
  return paginator(msg, entries, {
    renderer(data = [], page, total) {
      if (Array.isArray(data)) return {
        embed: {
          title: `${title || translate('leaderboard-title')} [${page}/${total}]`,
          description: data.map(entry => `${entry.rank + 1}. ${entry.username} #${entry.id}`).join('\n') || emptyMessage,
        },
      };
      else {
        const ret = singleResult(data);
        ret.embed.author.name += ` [${page}/${total}]`;
        return ret;
      }
    },
    page,
  });
}

module.exports = new Command({
  title: '',
  alias: ['leaderboard', 'lb', 'rank'],
  examples: [
    '`<command> MyUser --register` - registers "MyUser" to your discord',
  ],
  usage: '[<me|main>|username]',
  description: 'Lookup current leaderboard',
  flags: [{
    alias: ['register', 'r', '+', 'save'],
    description: 'Store a user on your discord',
  }, {
    alias: ['unregister', 'u', '-', 'delete'],
    description: 'Remove a user from your discord',
  }, {
    alias: ['main', 'm', 'me'],
    description: 'Store/Lookup main account (limit one)',
  }],
  disabled,
  handler,
});
