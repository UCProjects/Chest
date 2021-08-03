const Command = require('chat-commands/src/command');
const disabled = require('../disabled');
const undercards = require('../undercards');
const login = require('../util/login');
const { parse } = require('node-html-parser');
const { translate } = require('../lang');
const { simpleMode } = require('../lang/extend');

function handler(msg, [pass] = [], flags = {}) {
  return login(process.env.UC_LOGIN)
    .then(Cookie => undercards.get('/Quests', { headers: { Cookie } }))
    .then(({ data }) => {
      simpleMode();
      const ret = {
        title: '',
        fields: [],
      };
      const page = parse(data);
      if (pass === 'pass' || flags.pass) {
        ret.title = translate('event-season-pass');
        ret.fields.push(...page.querySelectorAll('[data-i18n-custom^="quest-s"][data-i18n-custom*="premium"]').map(getInfo));
      } else {
        ret.title = translate('header-quests');
        ['start', 'early', 'mid'].forEach(key => {
          const l = [];
          page.querySelectorAll(`[data-i18n-custom^="quest-s"][data-i18n-custom*="${key}"]`).forEach((el) => {
            const { name, value } = getInfo(el);
            l.push(`**${name}**\n\t${value}`);
          });
          if (!l.length) { // Get when it unlocks?
            return;
          }
          ret.fields.push({
            name: `○ ${translate(`event-season-${key}`)}`,
            value: l.join('\n'),
          })
        });
      }
      return { embed: ret };
    });
}

function getInfo(el) {
  const reward = el.parentNode.parentNode.querySelector('td:nth-child(3)');
  return {
    name: parseCustom(el),
    value: `🎁 ${getReward(reward)}`,
  };
}

function getReward(el) {
  const reward = el.childNodes.find(el => !!el.classList);
  if (reward.classList.contains('card-preview')) {
    return `${translate('cardskins-shop-card')} - ${getImageName(reward)}`
  } else if (reward.classList.contains('card-skin-slot')) { // Card skin
    return `${translate('reward-card-skin')} - ${reward.getAttribute('data-skin-name')}`;
  } else if (reward.classList.contains('avatar')) { // Avatar
    return `${translate('reward-avatar')} - ${getImageName(reward)}`;
  } else if (reward.classList.contains('crop-container')) { // Profile skin
    return `${translate('reward-profile-skin')} - ${getImageName(el.querySelector('img'))}`;
  } else if (reward.classList.contains('emoteGroup')) { // Emotes
    return `${translate('reward-emote')} - ${getImageName(el.querySelector('img'))}`;
  } else if (reward.getAttribute('data-i18n-tips')) { // reward-gold, reward-super-pack, reward-shiny-pack, reward-pack, reward-dust
    return `${translate(reward.getAttribute('data-i18n-tips'))} ${el.text.trim()}`;
  } else if (reward.getAttribute('data-i18n-custom')) { // UCP and such
    return parseCustom(reward);
  }
  return 'Unknown!'
}

function parseCustom(el) {
  return translate(el.getAttribute('data-i18n-custom'), ...el.getAttribute('data-i18n-args').split(','));
}

function getImageName(el) {
  const src = el.getAttribute('src');
  return src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.')).replace(/_/g, ' ')
}

module.exports = new Command({
  title: '',
  alias: ['quests', 'quest'],
  examples: [],
  usage: '[pass]',
  description: 'Lookup current quests and rewards',
  flags: [{
    alias: ['pass'],
    description: 'Show pass quests',
  }],
  disabled: (msg) => !process.env.UC_LOGIN || disabled(msg),
  handler,
});
