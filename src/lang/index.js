const EventEmitter = require('events').EventEmitter;
const Banana = require('banana-i18n');
const undercards = require('../undercards');
const extend = require('./extend');

const banana = new Banana('en');
const events = new EventEmitter();

const hour = 60 * 1000;
let next = Date.now();

exports.translate = (message, ...args) => {
  let text;
  try {
    text = banana.i18n(message, ...args);
  } catch (e) {
    console.error(e);
    text = 'Translation error.';
  }
  return text === message ? '' : text;
};

// TODO: load all languages at once
exports.load = () => {
  if (Date.now() < next) return Promise.resolve();
  return undercards.get('/translation/en.json')
    .then(({data}) => {
      next = Date.now() + hour;
      setTimeout(() => events.emit('load', { ...data }));
      return data;
    }).then((data) => banana.load(data))
    .catch(console.error);
};

exports.events = events;

extend(banana, exports.translate);
