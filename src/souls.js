const souls = ['KINDNESS', 'JUSTICE', 'PATIENCE', 'PERSEVERANCE', 'BRAVERY', 'DETERMINATION', 'INTEGRITY'];

function aliases(name = '') {
  const ret = [name.toLowerCase()];
  switch (name) {
    case 'DETERMINATION':
      ret.push('dt');
      break;
    case 'INTEGRITY':
      ret.push('integ', 'int', 'teg', 'tegrity');
      break;
    case 'PERSEVERANCE':
      ret.push('pers');
      break;
  }
  return ret;
}

function find(name = '') {
  const needle = name.toLowerCase();
  return souls.find(soul => aliases(soul).includes(needle));
}

const colors = {
  KINDNESS: 49152,
  JUSTICE: 16776960,
  PATIENCE: 4324607,
  PERSEVERANCE: 13972953,
  BRAVERY: 16557312,
  DETERMINATION: 16711680, 
  INTEGRITY: 25855,
};

module.exports = {
  souls,
  aliases,
  find,
  colors,
};
