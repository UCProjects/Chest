function image(data, path = 'powers') {
  return `<img src="https://undercards.net/images/${path}/${data}.png">`;
}

function text(data, text, path = 'powers') {
  return `<span class="outlined" data-overlay="${text}">${image(data, path)}</span>`;
}

module.exports = function buildStatus(card) {
  const stats = [];
  if (card.cost < card.originalCost) stats.push('BonusCost');
  else if (card.cost > card.originalCost) stats.push('MalusCost');
  if (card.rarity === 'DETERMINATION') stats.push('Determination');
  if (card.attack > card.originalAttack) stats.push('BonusAtk');
  else if (card.attack < card.originalAttack) stats.push('MalusAtk');
  if (card.maxHp > card.originalHp) stats.push('BonusHp');
  else if (card.maxHp < card.originalHp) stats.push('MalusHp');
  if (card.caughtMonster || card.catchedMonster) stats.push('Box');
  if (card.fixedId === 874) stats.push('Underevent2024');

  card.statuses?.forEach(({
    name = '',
    displayCounter = false,
    counter = 0,
  }) => stats.push(displayCounter ? text(name, counter) : name));

  if (card.creatorInfo || card.creatorFixedId) stats.push('created');

  stats.reverse(); // Order them "properly"
  card.status = stats.map((stat = '') => stat.startsWith('<') ? stat : image(stat));
}
