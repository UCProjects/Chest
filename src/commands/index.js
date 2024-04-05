const Command = require('chat-commands/src/command');
const HelpCommand = require('chat-commands/src/command/help');
const fs = require('fs').promises;

const commands = new Map([['', new Command()]]);

fs.readdir(__dirname)
  .then(files => {
    const array = [];
    files.forEach((file) => {
      if (file.startsWith('.') || file.match(/index\.js$/) || !file.endsWith('.js')) return;

      const command = require(`./${file}`);
      if (!(command instanceof Command)) return console.debug('Bad file:', file);

      array.push(command);
      command.alias.forEach((alias) => {
        alias = alias.toLowerCase();
        if (commands.has(alias)) {
          console.debug(`${file}:${alias} already registered`);
        } else {
          commands.set(alias, command);
        }
      });
    });

    // Add default help command
    const help = new HelpCommand({
      commands: array,
      description: process.env.HELP ? `Want a feature? Found a bug? [Tell us!](${process.env.HELP})` : undefined,
    });
    array.push(help);
    commands.set('help', help)
  })
  .catch(console.error);

module.exports = commands;
