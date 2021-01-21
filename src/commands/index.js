const Command = require('chat-commands/src/command');
const HelpCommand = require('chat-commands/src/help');
const fs = require('fs').promises;

const commands = new Map();

fs.readdir(__dirname)
  .then(files => {
    const array = [];
    files.forEach((file) => {
      if (file.startsWith('.') || file.match(/index\.js$/)) return;

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
    });
    array.push(help);
    commands.set('help', help)
  })
  .catch(console.error);

module.exports = commands;
