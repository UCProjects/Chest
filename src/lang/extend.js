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
  const obj = {
    ucp: ([ucp = '']) => simple ? ucp : getText(ucp, 'ucp'),
    tribe(nodes) {
      const {args: [key, count = 1], override, empty} = parse(nodes);
      if (empty) return '';
      const text = override || translate(getKey('tribe', key), count);
      return getText(text, 'underlined');
    },
    soul(nodes) {
      const {args: [key], override, empty} = parse(nodes);
      if (empty) return '';
      const text = override || translate(getKey('soul', key));
      return getText(text, key);
    },
    kw(nodes) {
      const {args: [key], override, empty} = parse(nodes);
      if (empty) return '';
      const text = override || translate(getKey('kw', key));
      return getText(text, 'underlined');
    },
    artifact(nodes) {
      const {args: [key], override, empty} = parse(nodes);
      if (empty) return '';
      const text = override || translate(getKey('artifact-name', key));
      return getText(text, 'underlined');
    },
    enchant(nodes) {
      const {args: [keyword, quantity = 1], override, empty} = parse(nodes);
      const text = override || translate(getKey('enchant', keyword), Number(quantity));
      return getText(text, 'underlined');
    },
    hp(nodes) {
      const {args: [number], override} = parse(nodes);
      const text = override || translate('stat-hp', number || 1);
      return `${number ? `${number} ` : ''}${getText(text, 'green')}`;
    },
    atk(nodes) {
      const {args: [number], override} = parse(nodes);
      const text = override || translate('stat-atk', number || 1);
      return `${number ? `${number} ` : ''}${getText(text, 'red')}`;
    },
    gold(nodes) {
      const {args: [number], override} = parse(nodes);
      const text = override || translate('stat-gold', number || 1);
      return `${number ? `${number} ` : ''}${getText(text, 'yellow')}`;
    },
    cost(nodes) {
      const {args: [number], override} = parse(nodes);
      const text = override || translate('stat-cost', number || 1);
      return `${number ? `${number} ` : ''}${getText(text, 'blue')}`;
    },
    kr(nodes) {
      const {override} = parse(nodes);
      const text = override || translate('stat-kr');
      return getText(text, 'PERSEVERANCE');
    },
    dmg(nodes) {
      const {args, override} = parse(nodes);
      const [number] = args;
      const text = override || translate('stat-dmg', number || 1);
      return `${number ? `${number} ` : ''}${getText(text, 'JUSTICE')}`;
    },
    card(nodes) {
      const {args: [idCard, quantity], override, empty} = parse(nodes);
      if (empty) return '';
      const text = override || translate(`card-name-${idCard}`, quantity || 1);
      return getText(text, 'PATIENCE', { card: idCard });
    },
    mode(nodes) {
      const {args: [key], empty} = parse(nodes);
      if (empty) return '';
      return translate(getKey('game-type', key));
    },
    rarity(nodes) {
      const {args: [rarity], override, empty} = parse(nodes);
      if (empty) return '';
      const text = override || translate(getKey('rarity', rarity));
      return getText(text, rarity);
    },
    division(nodes) {
      const {args: [division, short], empty} = parse(nodes);
      if (empty) return '';
      if (division.includes('_I')) {
        const index = division.lastIndexOf('_');
        const rank = division.substring(0, index);
        const number = division.substring(index + 1);
        const title = translate(getKey('division', rank));
        return short === 'short' ? title.substring(0, 1) : `${title} ${number}`;
      }
      if (division === 'T') return division;
      const title = translate(getKey('division', division));
      return short ? title.substring(0, 1) : title;
    },
    cosmetic(nodes) {
      const {args: [cosmetic, name], empty} = parse(nodes);
      if (empty || !name) return '';
      return `${translate(getKey('reward', cosmetic))} - ${name}`;
    },
    style(nodes) {
      const {args: [clazz, text]} = parse(nodes);
      return getText(text, clazz);
    },
    switch_left: (nodes) => switchHandler(nodes, 'left'),
    switch_right: (nodes) => switchHandler(nodes, 'right'),
    stats(nodes) {
      const { args } = parse(nodes);
      if (simple) return args.join('/');
      return ['cost', 'attack', 'health']
        .slice(Math.max(0, 3 - nodes.length))
        .map((clazz, i) => args[i].replace(/\d+/, `<span class="${clazz}">$&</span>`))
        .join('/');
    },
    image(nodes) {
      const { args: [img, name, width = 64, height = 16, card = 0] } = parse(nodes);
      // const mouseOver = card ? `onmouseover="displayCardHelp(this, ${card});" onmouseleave="removeCardHover();" ` : '';
      if (simple) return getText(name);
      return `<div><img style="width: ${width}px; height: ${height}px;" class="inserted-img" src="https://undercards.net/images/inserted/${img}.png" alt="${name}"/></div>`;
    },
  };

  const { emitter } = banana.parser;
  Object.entries(obj).forEach(([key, val]) => {
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
