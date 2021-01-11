const { translate } = require(".");

const extensions = {};
extensions.ucp = ([ucp]) => getText(ucp, 'ucp');
extensions.tribe = (nodes) => {
  const {args, override, empty} = parse(nodes);
  if (empty) return '';
  const text = override || translate(getKey('tribe', args[0]), args[1] || 1);
  return getText(text, 'underlined');
};
extensions.soul = (nodes) => {
  const {args, override, empty} = parse(nodes);
  if (empty) return '';
  const text = override || translate(getKey('soul', args[0].replace(/_/g, '-')));
  return getText(text, args[0]);
};
extensions.kw = (nodes) => {
  const {args, override, empty} = parse(nodes);
  if (empty) return '';
  const text = override || translate(getKey('kw', args[0]));
  return getText(text, 'underlined');
};
extensions.artifact = (nodes) => {
  const {args, override, empty} = parse(nodes);
  if (empty) return '';
  const text = override || translate(getKey('artifact-name', args[0]));
  return getText(text, 'underlined');
};
extensions.hp = (nodes) => {
  const {args: [number], override} = parse(nodes);
  const text = override || translate('stat-hp', number || 1);
  return `${number ? `${number} ` : ''}${getText(text, 'green')}`;
};
extensions.atk = (nodes) => {
  const {args: [number], override} = parse(nodes);
  const text = override || translate('stat-atk', number || 1);
  return `${number ? `${number} ` : ''}${getText(text, 'red')}`;
};
extensions.gold = (nodes) => {
  const {args: [number], override} = parse(nodes);
  const text = override || translate('stat-gold', number || 1);
  return `${number ? `${number} ` : ''}${getText(text, 'yellow')}`;
};
extensions.cost = (nodes) => {
  const {args: [number], override} = parse(nodes);
  const text = override || translate('stat-cost', number || 1);
  return `${number ? `${number} ` : ''}${getText(text, 'blue')}`;
};
extensions.kr = (nodes) => {
  const {override} = parse(nodes);
  const text = override || translate('stat-kr');
  return getText(text, 'PERSEVERANCE');
};
extensions.dmg = (nodes) => {
  const {args, override} = parse(nodes);
  const [number] = args;
  const text = override || translate('stat-dmg', number || 1);
  return `${number ? `${number} ` : ''}${getText(text, 'JUSTICE')}`;
};
extensions.card = (nodes) => {
  const {args: [idCard, quantity], override, empty} = parse(nodes);
  if (empty) return '';
  const text = override || translate(`card-name-${idCard}`, quantity || 1);
  return getText(text, 'PATIENCE', { card: idCard });
};
extensions.mode = (nodes) => {
  const {args, empty} = parse(nodes);
  if (empty) return '';
  return translate(getKey('game-type', args[0]));
};
extensions.rarity = (nodes) => {
  const {args: [rarity], override, empty} = parse(nodes);
  if (empty) return '';
  const text = override || translate(getKey('rarity', rarity));
  return getText(text, rarity);
};
extensions.division = (nodes) => {
  const {args, empty} = parse(nodes);
  if (empty) return '';
  return undefined;
};
extensions.cosmetic = (nodes) => {
  const {args: [cosmetic, name], empty} = parse(nodes);
  if (empty || !name) return '';
  return `${translate(getKey('reward'), cosmetic)} - ${name}`;
};

function parse(nodes) {
  const found = nodes.findIndex((node) => node.startsWith('override='));
  const override = !!~found && nodes.splice(found, 1)[0];
  return {
    args: nodes,
    override: override && override.substring(override.indexOf('=') + 1),
    empty: !nodes.length && !override,
  };
}

function getKey(prefix, name) {
  return `${prefix}-${name.toLowerCase().replace(/_/g, '-')}`;
}

function getText(text, classes, data = {}) {
  return `<span class="${classes}"${Object.keys(data).map((key) => ` data-${key}="${data[key]}"`).join('')}>${text}</span>`;
}

module.exports = (banana, translate) => {
  const obj = {};
  obj.ucp = ([ucp]) => getText(ucp, 'ucp');
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
  obj.division = (nodes) => {
    const {args, empty} = parse(nodes);
    if (empty) return '';
    return undefined;
  };
  obj.cosmetic = (nodes) => {
    const {args: [cosmetic, name], empty} = parse(nodes);
    if (empty || !name) return '';
    return `${translate(getKey('reward'), cosmetic)} - ${name}`;
  };
  
  const { emitter } = banana.parser;
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    if (typeof val !== 'function') return;
    emitter[key] = val;
  });
};
