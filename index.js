require('dotenv').config();
const Configstore = require('configstore');
const Discord = require('eris');
const parseFlags = require('./src/util/parseFlags');
const loadPrefixes = require('./src/util/loadPrefixes');
const cache = require('./src/cache');
const image = require('./src/image');

const prefixes = loadPrefixes(process.env.PREFIXES, ['@mention', 'card!', 'chest!', 'Card!', 'Chest!', 'c!', 'C!']);

const token = process.env.TOKEN;
const config = new Configstore('robot-98');

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

  const args = rawText.split(/\s+/g);
  let command;

  // TODO: split prefixes and aliases
  if (![connection.user.mention, 'chest!', 'Chest!'].includes(prefix)) {
    command = prefix.substring(0, prefix.length - 1);
  } else {
    command = args.shift() || '';
  }

  Promise.resolve(processCommand(msg, { command, args, flags }))
    .then((response) => {
      if (!response || response instanceof Discord.Message) return;
      return connection.createMessage(msg.channel.id, response);
    })
    .catch(catchError);
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

function processCommand(msg, {
  command = '', args = [], flags = {},
}) {
  if (!command) return '';
  let type = 'whitelist';
  switch (command.toLowerCase()) {
    case 'bl':
    case 'blacklist':
      type = 'blacklist'; // fall-through
    case 'wl':
    case 'whitelist':
      flags.add = flags.add || args.includes('add');
      flags.clear = flags.clear || args.includes('clear');
      return list(msg, flags, type);
    case 'c':
    case 'card':
    case 'find':
    case 'lookup': return lookup(msg, args.join(' '));
    // TODO: help command
    case 'link':
    case 'invite': return !process.env.INVITE ? '' : {
      embed: {
        description: `[Add me to your server!](${process.env.INVITE})`,
      }
     };
  }
  return '';
}

function list(msg, flags = {}, type) {
  if (!msg.channel.permissionsOf(msg.author.id).has('manageRoles')) return;
  const path = `discord.${msg.guildID || msg.channel.guild.id}.${type}`;
  if (flags.clear) {
    config.delete(path);
    return `Cleared ${type}`;
  } else if (flags.add) {
    config.set(`${path}.${msg.channel.id}`, true);
    return `Added channel to ${type}`;
  } else if (flags.remove) {
    config.delete(`${path}.${msg.channel.id}`);
    return `Removed channel from ${type}`;
  } else if (config.has(path)) {
    return `Current ${type}: ${Object.keys(config.get(path)).map(id => {
      const channel = connection.getChannel(id);
      if (channel) return channel.mention;
      // Channel no longer exists - remove from memory
      config.delete(`${page}.${id}`);
      return undefined;
    }).filter(_=>_).join(', ')}`;
  } else {
    const sub = type === 'whitelist' ? 'blacklist for disabled' : 'whitelist for allowed';
    return `No ${type} - see ${sub} channels!`
  }
}

function disabled(guildID, channelID) {
  const prefix = `discord.${guildID}`;
  return config.has(`${prefix}.blacklist.${channelID}`) || // Is on the black list OR
    config.has(`${prefix}.whitelist`) && // Has a whitelist BUT
    !config.has(`${prefix}.whitelist.${channelID}`); // is not on the whitelist
}

function lookup(msg, cardName = '') {
  if (disabled(msg.guildID || msg.channel.guild.id, msg.channel.id)) {
    console.debug('Commands disabled on channel');
    return;
  }
  if (!cardName.trim()) return '\* No name provided';
  // Lookup and return card
  return cache.get(cardName.trim())
    .then((card) => {
      if (card) {
        return image(card);
      } else {
        return `\* ${cardName} not found.`
      }
    })
    .then((results) => {
      if (!results) return results;
      if (results instanceof Buffer) {
        return connection.createMessage(msg.channel.id, undefined, {
          name: 'card.png',
          file: results,
        });
      }
      return connection.createMessage(msg.channel.id, results);
    });
}

function catchError(e) {
  console.error(e);
  return connection.createMessage(msg.channel.id, 'Error processing command')
    .catch(console.error); // Oh the irony
}
