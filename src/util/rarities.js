exports.generic = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'DETERMINATION'];
exports.full = ['BASE', ...exports.generic, 'TOKEN'];

exports.colors = {
  DETERMINATION: 16711680,
  LEGENDARY: 16766720,
  EPIC: 13972953,
  RARE: 47359,
  COMMON: 15987699,
  BASE: 8421504,
  TOKEN: 51200,
};

exports.super = exports.generic.slice(0, 4);
exports.final = exports.generic.slice(1);
