require('dotenv').config();
const Configstore = require('configstore');
const Discord = require('eris');
const parseFlags = require('./src/util/parseFlags');
const loadPrefixes = require('./src/util/loadPrefixes');
const cache = require('./src/cache');
const image = require('./src/image');

const prefixes = loadPrefixes(process.env.PREFIXES, ['@mention', 'card!', 'chest!', 'Card!', 'Chest!']);

const token = process.env.TOKEN;
const config = new Configstore('config.json');

const connection = new Discord.Client(token);

connection.on('messageCreate', (msg) => {
  const ignoreSelf = msg.author.id === connection.user.id;
  const ignoreBots = msg.author.bot;
  if (ignoreSelf || ignoreBots) return;

  const filtered = msg.content.replace(/<@!/g, '<@');
  const from = prefixes.map((pref) => pref.replace('@mention', connection.user.mention)).filter(_ => _);
  const prefix = from.find((pref) => filtered.startsWith(pref));
  
  if (!prefix) return;
  
  const {
    message: rawText = '',
    flags = {},
  } = parseFlags(filtered.substring(prefix.length));
  
  if (['card!', 'chest!'].includes(prefix.toLowerCase())) {
    lookup(msg, rawText).catch((e) => {
      console.error(e);
      return connection.createMessage(msg.channel.id, 'Error retrieving card')
        .catch(console.error); // Oh the irony
    });
  } else {
    // Process command
  }
}).on('error', (e) => {
  console.error(e);
});

cache.load()
  .then(() => connection.connect())
  .then(() => console.log('Connected'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

function whitelist(msg, flags) {
  if (!msg.channel.permissionsOf(msg.author.id).has('manageRoles')) return;
  const path = `discord.${msg.guildID || msg.channel.guild.id}.whitelist`;
  if (flags.clear) {
    config.delete(path);
    return 'Cleared whitelist';
  } else if (flags.add) {
    const value = config.get(path) || {};
    value[msg.channel.id] = true;
    config.set(path, value);
  } else if (config.has(path)) {
    return `Whitelisted:\n${Object.keys(config.get(path)).map(id => connection.getChannel(id).mention).join('\n')}`;
  } else {
    return 'No whitelist - all channels can use me!';
  }
}

function lookup(msg, cardName) {
  const path = `discord.${msg.guildID || msg.channel.guild.id}.whitelist`;
  if (config.has(path)) {
    if (!config.has(`${path}.${msg.channel}`)) {
      console.debug('Channel not whitelisted');
      return;
    }
  }
  // Lookup and return card
  return cache.get(cardName)
    .then((card) => {
      if (card) {
        return image(card);
      } else {
        return `\* ${cardName} not found.`
      }
    })
    .then((results) => {
      if (results instanceof Buffer) {
        return connection.createMessage(msg.channel.id, undefined, {
          name: 'card.png',
          file: results,
        });
      }
      return connection.createMessage(msg.channel.id, results);
    });
}
