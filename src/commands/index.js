const Command = require('chat-commands/src/command');
const fs = require('fs').promises;

const commands = new Map();

fs.readdir(__dirname)
  .then(files => files.forEach((file) => {
    if (file.startsWith('.') || file.match(/index\.js$/)) return;

    const command = require(`./${file}`);
    if (!(command instanceof Command)) return console.debug('Bad file:', file);

    command.alias.forEach((alias) => {
      alias = alias.toLowerCase();
      if (commands.has(alias)) {
        console.debug(`${file}:${alias} already registered`);
      } else {
        commands.set(alias, command);
      }
    });
  }))
  .catch(console.error);

module.exports = commands;
