function image(data, path = 'powers') {
  return `<img src="https://undercards.net/images/${path}/${data}.png">`;
}

function text(data, text, path = 'powers') {
  return `<span class="outlined" data-overlay="${text}">${image(data, path)}</span>`;
}

module.exports = function buildStatus(card) {
  const stats = [];
  if (card.cost < card.originalCost) stats.push('bonusCost');
  else if (card.cost > card.originalCost) stats.push('malusCost');
  if (card.rarity === 'DETERMINATION') stats.push('determination');
  if (card.loop) stats.push(text('loop', card.loop));
  if (card.taunt) stats.push('taunt');
  if (card.charge) stats.push('charge');
  if (card.haste) stats.push('haste');
  if (card.attack > card.originalAttack) stats.push('bonusAtk');
  else if (card.attack < card.originalAttack) stats.push('malusAtk');
  if (card.maxHp > card.originalHp) stats.push('bonusHp');
  else if (card.maxHp < card.originalHp) stats.push('malusHp');
  if (card.paralyzed) stats.push('paralyzed');
  if (card.candy) stats.push('candy');
  if (card.kr) stats.push('poison');
  if (card.armor === true) stats.push('armor');
  else if (card.armor) stats.push(text('armor', card.armor));
  if (card.dodge) stats.push(text('dodge', card.dodge));
  if (card.burn) stats.push(text('burn', card.burn));
  if (card.cantAttack) stats.push('cantAttack');
  if (card.anotherChance) stats.push('anotherChance');
  if (card.invulnerable) stats.push('invulnerable');
  if (card.transparency) stats.push('transparency');
  if (card.silence) stats.push('silenced');
  // if (card.caughtMonster) stats.push('box');
  if (card.ranged) stats.push('ranged'); // Legacy
  if (card.thorns) stats.push(text('thorns', card.thorns)); // Legacy
  if (card.caughtMonster ||card.catchedMonster) stats.push('box');
  if (card.shockEnabled) stats.push('shock');
  if (card.supportEnabled) stats.push('support');
  if (card.bullseyeEnabled) stats.push('bullseye');
  if (card.wanted) stats.push('wanted');
  if (card.fixedId === 874) stats.push("underevent2024");

  card.statuses?.forEach(({
    name = '',
    displayCounter = false,
    counter = 0,
  }) => stats.push(displayCounter ? text(name, counter) : name));

  if (card.creatorInfo || card.creatorFixedId) stats.push('created');

  stats.reverse(); // Order them "properly"
  card.status = stats.map((stat = '') => stat.startsWith('<') ? stat : image(stat));
}
