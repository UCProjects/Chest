const htmlImage = require('node-html-to-image');
const fs = require('fs').promises;
const path = require('path');
const card = require('./template');
const deck = require('./deck');
const buildStatus = require('./helper');
const pack = require('./pack');

// Build a card image (TODO: cache images)
exports.card = (data) => {
  buildStatus(data);
  return htmlImage({
    html: card,
    content: data,
    puppeteerArgs: {
      fullPage: false,
    },
    beforeScreenshot(page) {
      return page.$eval('.card', el => el.offsetHeight)
        .then(height => page.$eval('body', (el, height) => el.style.height = height, height))
        .then(() => page.$eval('.name', (el, size = 15, step = 0.5) => {
          while (el.scrollWidth > el.clientWidth && size-step > 7) {
            size -= step;
            el.style.fontSize = `${size}px`;
          }
        }))
        //.then(() => page.$eval('.card', el => el.outerHTML)).then(console.log)
        .catch(console.error);
    }
  })
    //.then((buffer) => cacheImage(buffer, card))
    .catch((e) => console.error('Failed to make card', e));
};
exports.deck = (data) => {
  return htmlImage({
    html: deck,
    content: data,
    puppeteerArgs: {
      fullPage: false,
    },
    beforeScreenshot(page) {
      return page.$eval('#deck', el => el.offsetHeight)
        .then(height => page.$eval('body', (el, height) => el.style.height = height, height))
        .catch(console.error);
    },
  })
    .catch(e => console.error('Failed to make deck', e));
};
exports.pack = (cards = []) => {
  cards.forEach(buildStatus)
  return htmlImage({
    html: pack,
    content: { cards },
    puppeteerArgs: {
      fullPage: false,
    },
    beforeScreenshot(page) {
      return page.$eval('#pack', el => el.offsetHeight)
        .then(height => page.$eval('body', (el, height) => el.style.height = height, height))
        .then(() => page.$$eval('.name', (e = []) => e.forEach(async (el) => {
          while (el.scrollWidth > el.clientWidth && size-step > 7) {
            size -= step;
            el.style.fontSize = `${size}px`;
          }
        })))
        .catch(console.error);
    },
  });
};

function cacheImage(buffer, card) {
  if (!buffer) throw new Error('Missing buffer');
  const file = path.join(process.cwd(), 'cards', 'en', `${card.id}.png`);
  return fs.mkdir(path.dirname(file), { recursive: true })
    .then(() => fs.writeFile(file, buffer))
    .then(() => buffer);
}
