const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const { browserArgs } = require('../proxy');

const TIMEOUT = 30000;
const MAX_PAGES = 2;

let browserPromise = null;
let active = 0;
const waiting = [];

function launch() {
  const promise = puppeteer.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', ...browserArgs()],
  });
  const reset = () => {
    if (browserPromise === promise) browserPromise = null;
  };
  promise.then((browser) => browser.once('disconnected', reset), reset);
  return promise;
}

function getBrowser() {
  if (!browserPromise) browserPromise = launch();
  return browserPromise;
}

function acquire() {
  if (active < MAX_PAGES) {
    active++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiting.push(resolve));
}

function release() {
  const next = waiting.shift();
  if (next) next();
  else active--;
}

async function capture(html, content, beforeScreenshot) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    page.setDefaultTimeout(TIMEOUT);
    await page.setContent(Handlebars.compile(html)(content), { waitUntil: 'networkidle0' });
    if (beforeScreenshot) await beforeScreenshot(page);
    const body = await page.$('body');
    return await body.screenshot({ type: 'png' });
  } finally {
    await page.close();
  }
}

module.exports = async function render(html, content, beforeScreenshot) {
  await acquire();
  try {
    return await capture(html, content, beforeScreenshot);
  } finally {
    release();
  }
};

module.exports.close = async () => {
  if (!browserPromise) return;
  const promise = browserPromise;
  browserPromise = null;
  await (await promise).close();
};
