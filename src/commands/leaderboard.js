const Command = require('chat-commands/src/command');
const Configstore = require('configstore');
const disabled = require('../disabled');
const { translate } = require('../lang');
const undercards = require('../undercards');

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
            return getRegistered(leaderboard, entries);
          }
          const user = findUser(leaderboard, needle);
          if (!user) return `* User \`${args.join(' ')}\` not found on leaderboard`;
          if (register) {
            if (!entries[user.id] && Object.keys(entries).filter(_ => _ !== 'main').length >= 10) {
              return '* Failed to register (limit 10 users)';
            } else {
              entries[user.id] = user.username;
              if (this.flag('main', flags)) {
                entries.main = user.id;
              }
              config.set(path, entries);
              return `Registered ${user.username}`;
            }
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
        return getRegistered(leaderboard, entries, { main: this.flag('main', flags) });
      } else if (needle) {
        return singleResult(findUser(leaderboard, needle)) ||
          `* User \`${args.join(' ')}\` not found`;
      } else {
        return multiResult(leaderboard.slice(0, 10));
      }
    });
}

function getRegistered(leaderboard = [userdata], entries = {}, {
  main = false,
} = {}) {
  if (main) {
    return singleResult(findUser(leaderboard, entries.main)) ||
        `* ${entries.main ? 'Main not found' : 'No main registered'}`;
  }
  const users = Object.keys(entries)
    .filter(_ => _ !== 'main')
    .map(id => findUser(leaderboard, id))
    .filter(_ => _);
  if (users.length === 1) return singleResult(leaderboard, users[0]);
  return multiResult(users, 'Registered users');
}

function findUser(leaderboard = [userdata], needle) {
  return leaderboard.find(e => e.usernameSafe === needle) ||
    leaderboard.find(e => e.id == needle);
}

function singleResult(entry = userdata) {
  if (entry === userdata) return false;
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
        value: translate(`{{DIVISION:${entry.division}}}`),
        inline: true,
      }, {
        name: translate('leaderboard-progress'),
        value: `${entry.eloRanked}${entry.division !== 'LEGEND' ? ` (${(entry.eloRanked % 25) / 25 * 100}%)` : ''}`,
        inline: true,
      }, {
        name: '------',
        value: 'Stats',
      }, {
        name: translate('leaderboard-w'),
        value: entry.winsRanked,
        inline: true,
      }, {
        name: translate('leaderboard-l'),
        value: entry.lossesRanked,
        inline: true,
      }, {
        name: translate('leaderboard-ws'),
        value: entry.winStreak,
        inline: true,
      }],
    },
  };
}
function multiResult(entries = [userdata], title) {
  return {
    embed: {
      title: title || translate('leaderboard-title'),
      description: entries.map(entry => `${entry.rank + 1}. ${entry.username} #${entry.id}`).join('\n') || '* None',
    },
  };
}

module.exports = new Command({
  title: '',
  alias: ['leaderboard', 'lb', 'rank'],
  examples: [],
  usage: '[<me|main>|username]',
  description: '',
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
