function image(data, path = 'powers') {
  return `<img src="https://undercards.net/images/${path}/${data}.png">`;
}

function text(data, text, path = 'powers') {
  return `<span class="outlined" data-overlay="${text}">${image(data, path)}</span>`;
}

function buildStatus(card) {
  const stats = [];
  if (card.cost < card.originalCost) stats.push('bonusCost');
  else if (card.cost > card.originalCost) stats.push('malusCost');
  if (card.rarity === 'DETERMINATION') stats.push('determination');
  if (card.taunt) stats.push('taunt');
  if (card.charge) stats.push('charge');
  if (card.haste) stats.push('haste');
  if (card.attack > card.originalAttack) stats.push('bonusAtk');
  else if (card.attack < card.originalAttack) stats.push('malusAtk');
  if (card.maxHp > card.originalHp) stats.push('bonusHp');
  // else minusHp
  if (card.paralyzed) stats.push('paralyzed');
  if (card.candy) stats.push('candy');
  if (card.kr) stats.push('poison');
  if (card.armor) stats.push(text('armor', card.armor)); // card.armor
  if (card.dodge) stats.push(text('dodge', card.dodge));
  if (card.burn) stats.push(text('burn', card.burn));
  if (card.cantAttack) stats.push('cantAttack');
  if (card.anotherChance) stats.push('anotherChance');
  if (card.invulnerable) stats.push('invulnerable');
  if (card.transparency) stats.push('transparency');
  if (card.silence) stats.push('silenced');
  // Legacy
  if (card.ranged) stats.push('ranged');
  if (card.thorns) stats.push(text('thorns', card.thorns));
  if (card.catchedMonster) stats.push('box');
  if (card.creatorFixedId) stats.push('created');
  card.status = stats.map((stat = '') => stat.startsWith('<') ? stat : image(stat));
}

module.exports = buildStatus;
