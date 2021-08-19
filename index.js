require('dotenv').config();
const commands = require('./src/commands');
const Discord = require('eris');
const parseFlags = require('chat-commands/src/flags');
const loadPrefixes = require('chat-commands/src/prefixes');
const cache = require('./src/cache');
const { get: getMode } = require('./src/mode');

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
  msg.reply = (content, file, mode = getMode(msg, flags)) => {
    if (content.file && !file) {
      file = content.file;
      delete content.file;
    }
    if (file && !file.name) {
      mode = file;
      file = undefined;
    }
    const _mode = mode.value || mode;
    if (_mode === 'normal' || (flags.bypass && _mode !== 'mod') || bypass(msg, {
      check: true,
      permission: 'manageMessages',
    })) {
      if (typeof content === 'string') {
        content = { content };
      }
      if (!content.message_reference) {
        content.message_reference = {
          message_id: msg.id,
        };
      }
      return connection.createMessage(msg.channel.id, content, file)
    } else {
      let warn = true;
      if (_mode === 'warn' || mode.note) {
        const message = mode.note || 'Redirecting to DM, please do not use commands here.';
        msg.reply(message, 'normal');
        warn = false;
      }
      return connection.getDMChannel(msg.author.id)
        .then(chan => chan.createMessage(content, file))
        .catch((e) => {
          if (warn) return msg.reply('Unable to DM. Please allow direct messages from server members.', 'normal');
          throw e;
        });
    }
  };
  msg.connection = connection;
  msg.mention = connection.user.mention;

  Promise.resolve(flags.help ? commands.get('help') : commands.get(command.toLowerCase()))
    .then((command) => {
      if (!command || !command.enabled(msg) && !bypass(msg, { check: flags.admin })) return undefined;
      if (flags.help) {
        if (msg.command) args.unshift(msg.command);
        msg.command = 'help';
      }
      return command.handle(msg, args, flags);
    })
    .then((response) => {
      if (!response || response instanceof Discord.Message) return undefined;
      return msg.reply(response);
    })
    .catch((e) => {
      if (typeof e === 'string') return msg.reply(e);
      console.error(e);
      return msg.reply(`Error processing command: ${e.message || e.toString()}`);
    })
    .catch(console.error); // Oh the irony
}).on('error', (e) => {
  console.error(e);
  process.exit();
});

cache.load()
  .then(() => connection.connect())
  .then(() => console.log('Connected'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

function bypass(msg, {
  check = false,
  permission = 'administrator',
}) {
  return check && msg.channel.permissionsOf && msg.channel.permissionsOf(msg.author.id).has(permission);
}
