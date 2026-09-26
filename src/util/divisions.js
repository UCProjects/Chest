const MIN_ELO = 1100;
const DIV_ELO = 30;

// Master tiers do not share a step size
const MASTER_ELO = {
  MASTER: 1550,
  HIGH_MASTER: 1650,
  ULTIMATE_MASTER: 1800,
  LEGEND: 2000,
};

const divisions = [
  'COPPER_III',
  'COPPER_II',
  'COPPER_I',
  'IRON_III',
  'IRON_II',
  'IRON_I',
  'GOLD_III',
  'GOLD_II',
  'GOLD_I',
  'EMERALD_III',
  'EMERALD_II',
  'EMERALD_I',
  'DIAMOND_III',
  'DIAMOND_II',
  'DIAMOND_I',
  'MASTER',
  'HIGH_MASTER',
  'ULTIMATE_MASTER',
  'LEGEND',
];

function normalize(division = '') {
  return `${division}`.trim().toUpperCase().replace(/ /g, '_');
}

function indexOf(division) {
  const index = divisions.indexOf(normalize(division));
  return index === -1 ? 0 : index;
}

function minElo(division) {
  const index = indexOf(division);
  return MASTER_ELO[divisions[index]] ?? MIN_ELO + (index * DIV_ELO);
}

function nextElo(division) {
  const index = indexOf(division);
  if (index >= divisions.length - 1) {
    return minElo(division);
  }
  return minElo(divisions[index + 1]);
}

// 0 when the division has no ceiling (LEGEND)
function width(division) {
  return nextElo(division) - minElo(division);
}

// Takes the server provided `eloProgress`, undefined when uncapped
function progress(division, eloProgress = 0) {
  const size = width(division);
  if (!size) return undefined;
  return Math.min(Math.max(eloProgress / size * 100, 0), 100);
}

module.exports = {
  divisions,
  normalize,
  indexOf,
  minElo,
  nextElo,
  width,
  progress,
};
