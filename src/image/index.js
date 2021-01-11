const htmlImage = require('node-html-to-image');
const fs = require('fs').promises;
const path = require('path');
const template = require('./template');
const buildStatus = require('./helper');

// Build a card image (TODO: cache images)
module.exports = (card) => {
  buildStatus(card);
  return htmlImage({
    html: template,
    content: card,
    puppeteerArgs: {
      fullPage: false,
    },
    beforeScreenshot(page) {
      return page.$eval('.card', el => el.offsetHeight)
        .then(height => page.$eval('body', (el, height) => el.style.height = height, height + 3))
        .then(() => page.$eval('.name', (el, size = 15, step = 0.5) => {
          while (el.scrollWidth > el.clientWidth && size-step > 7) {
            size -= step;
            el.style.fontSize = `${size}px`;
          }
        }))
        .catch(console.error);
    }
  })
    //.then((buffer) => cacheImage(buffer, card))
    .catch((e) => console.error('Failed to make card', e));
};

function cacheImage(buffer, card) {
  if (!buffer) throw new Error('Missing buffer');
  const file = path.join(process.cwd(), 'cards', 'en', `${card.id}.png`);
  return fs.mkdir(path.dirname(file), { recursive: true })
    .then(() => fs.writeFile(file, buffer))
    .then(() => buffer);
}
