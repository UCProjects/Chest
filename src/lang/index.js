const Banana = require('banana-i18n');
const extend = require('./extend');

const banana = new Banana('en');

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
exports.load = (data, lang) => banana.load(data, lang);

extend(banana, exports.translate);
