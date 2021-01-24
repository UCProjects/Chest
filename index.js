require('dotenv').config();
const commands = require('./src/commands');
const Discord = require('eris');
const parseFlags = require('chat-commands/src/flags');
const loadPrefixes = require('chat-commands/src/prefixes');
const cache = require('./src/cache');

const prefixes = loadPrefixes(process.env.PREFIXES, ['@mention', 'card!', 'chest!', 'Card!', 'Chest!', 'c!', 'C!']);

const token = process.env.TOKEN;
if (!token) throw new Error('Missing token');

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
  if (['card!', 'Card!'].includes(prefix)) {
    command = prefix.substring(0, prefix.length - 1);
  } else {
    command = args.shift() || '';
  }

  msg.prefix = prefix;
  msg.command = command;
  msg.reply = (content, file) => connection.createMessage(msg.channel.id, content, file);
  msg.connection = connection;
  msg.mention = connection.user.mention;

  Promise.resolve(commands.get(command.toLowerCase()))
    .then((command) => {
      if (!command) {
        if (['c!', 'C!'].includes(msg.prefix)) {
          return Promise.resolve(commands.get('help'))
            .then(c => c.handle(msg, args, flags))
            .then((response) => {
              if (response && response.embed) {
                response.content = `**Warning**: \`${msg.prefix}\` now stands for \`chest!\`.`;
              }
              return response;
            });
        }
        else return undefined;
      }
      if (!command.enabled(msg)) return undefined;
      return command.handle(msg, args, flags);
    })
    .then((response) => {
      if (!response || response instanceof Discord.Message) return undefined;
      return msg.reply(response);
    })
    .catch((e) => {
      console.error(e);
      return msg.reply('Error processing command')
        .catch(console.error); // Oh the irony
    });
}).on('error', console.error);

cache.load()
  .then(() => connection.connect())
  .then(() => console.log('Connected'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
