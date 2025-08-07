let simple = false;

function parse(nodes) {
  const found = nodes.findIndex((node) => node.startsWith('override='));
  const override = !!~found && nodes.splice(found, 1)[0];
  return {
    /**
     * @type {String[]}
     */
    args: nodes,
    override: override && override.substring(override.indexOf('=') + 1),
    empty: !nodes.length && !override,
  };
}

function getKey(prefix, name) {
  return `${prefix}-${name.toLowerCase().replace(/_/g, '-')}`;
}

function getText(text, classes, data = {}) {
  if (simple) return classes === 'underlined' ? `__${text}__` : `**${text}**`;
  return `<span class="${classes}"${Object.keys(data).map((key) => ` data-${key}="${data[key]}"`).join('')}>${text}</span>`;
}

module.exports = (banana, translate) => {
  const obj = {};
  obj.ucp = ([ucp]) => simple ? ucp : getText(ucp, 'ucp');
  obj.tribe = (nodes) => {
    const {args, override, empty} = parse(nodes);
    if (empty) return '';
    const text = override || translate(getKey('tribe', args[0]), args[1] || 1);
    return getText(text, 'underlined');
  };
  obj.soul = (nodes) => {
    const {args, override, empty} = parse(nodes);
    if (empty) return '';
    const text = override || translate(getKey('soul', args[0].replace(/_/g, '-')));
    return getText(text, args[0]);
  };
  obj.kw = (nodes) => {
    const {args, override, empty} = parse(nodes);
    if (empty) return '';
    const text = override || translate(getKey('kw', args[0]));
    return getText(text, 'underlined');
  };
  obj.artifact = (nodes) => {
    const {args, override, empty} = parse(nodes);
    if (empty) return '';
    const text = override || translate(getKey('artifact-name', args[0]));
    return getText(text, 'underlined');
  };
  obj.hp = (nodes) => {
    const {args: [number], override} = parse(nodes);
    const text = override || translate('stat-hp', number || 1);
    return `${number ? `${number} ` : ''}${getText(text, 'green')}`;
  };
  obj.atk = (nodes) => {
    const {args: [number], override} = parse(nodes);
    const text = override || translate('stat-atk', number || 1);
    return `${number ? `${number} ` : ''}${getText(text, 'red')}`;
  };
  obj.gold = (nodes) => {
    const {args: [number], override} = parse(nodes);
    const text = override || translate('stat-gold', number || 1);
    return `${number ? `${number} ` : ''}${getText(text, 'yellow')}`;
  };
  obj.cost = (nodes) => {
    const {args: [number], override} = parse(nodes);
    const text = override || translate('stat-cost', number || 1);
    return `${number ? `${number} ` : ''}${getText(text, 'blue')}`;
  };
  obj.kr = (nodes) => {
    const {override} = parse(nodes);
    const text = override || translate('stat-kr');
    return getText(text, 'PERSEVERANCE');
  };
  obj.dmg = (nodes) => {
    const {args, override} = parse(nodes);
    const [number] = args;
    const text = override || translate('stat-dmg', number || 1);
    return `${number ? `${number} ` : ''}${getText(text, 'JUSTICE')}`;
  };
  obj.card = (nodes) => {
    const {args: [idCard, quantity], override, empty} = parse(nodes);
    if (empty) return '';
    const text = override || translate(`card-name-${idCard}`, quantity || 1);
    return getText(text, 'PATIENCE', { card: idCard });
  };
  obj.mode = (nodes) => {
    const {args, empty} = parse(nodes);
    if (empty) return '';
    return translate(getKey('game-type', args[0]));
  };
  obj.rarity = (nodes) => {
    const {args: [rarity], override, empty} = parse(nodes);
    if (empty) return '';
    const text = override || translate(getKey('rarity', rarity));
    return getText(text, rarity);
  };
  const grade = ['-', '', '+'];
  obj.division = (nodes) => {
    const {args: [division, short], empty} = parse(nodes);
    if (empty) return '';
    if (division.includes('_')) {
      const [rank = '', number = ''] = division.split('_');
      const title = translate(getKey('division', rank));
      return short ? title.substring(0, 1) : `${title} ${number}`;
    }
    if (division === 'T') return rank;
    const title = translate(getKey('division', division.substring(0, 1)))
    return short ? title.substring(0, 1) : `${title}${grade[division.length - 1]}`;
  };
  obj.cosmetic = (nodes) => {
    const {args: [cosmetic, name], empty} = parse(nodes);
    if (empty || !name) return '';
    return `${translate(getKey('reward', cosmetic))} - ${name}`;
  };
  obj.style = (nodes) => {
    const {args: [clazz, text]} = parse(nodes);
    return getText(text, clazz);
  };
  obj.switch_left = (nodes) => switchHandler(nodes, 'left');
  obj.switch_right = (nodes) => switchHandler(nodes, 'right');
  obj.stats = (nodes) => {
    const { args } = parse(nodes);
    if (simple) return args.join('/');
    return ['cost', 'attack', 'health']
      .slice(Math.max(0, 3 - nodes.length))
      .map((clazz, i) => args[i].replace(/\d+/, `<span class="${clazz}">$&</span>`))
      .join('/');
  };
  obj.image = (nodes) => {
    const { args: [img, name, width = 64, height = 16, card = 0] } = parse(nodes);
    // const mouseOver = card ? `onmouseover="displayCardHelp(this, ${card});" onmouseleave="removeCardHover();" ` : '';
    return `<div><img style="width: ${width}px; height: ${height}px;" class="inserted-img" src="https://undercards.net/images/inserted/${img}.png" alt="${name}"/></div>`;
  };

  const { emitter } = banana.parser;
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    if (typeof val !== 'function') return;
    emitter[key] = val;
  });
};

function switchHandler(nodes, direction) {
  const {args: [temp, text = temp]} = parse(nodes);
  const opacity = isNaN(Number(temp)) ? 1 : Number(temp);
  const classes = [`switch_${direction}`];
  if (opacity <= 0) {
    classes.push('invisible');
  }
  return getText(text, classes.join(' '));
}

module.exports.simpleMode = () => simple = true;

module.exports.normalMode = () => simple = false;
