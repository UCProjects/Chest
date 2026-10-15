const undercards = require('../undercards');
const login = require('./login');

const ttl = 30 * 1000;
const maxStale = 10 * 60 * 1000;

let entry = null;

async function fetchLeaderboard() {
  const Cookie = await login(process.env.UC_LOGIN);
  const { data } = await undercards.get('/Leaderboard', {
    headers: { Cookie },
    params: { action: 'ranked' },
  });
  const leaderboard = JSON.parse(data.leaderboard);
  leaderboard.forEach((e, i) => {
    e.rank = i;
  });
  return leaderboard;
}

function rankedLeaderboard() {
  if (entry && Date.now() - entry.time < ttl) return entry.promise;
  const old = entry;
  const current = { time: Date.now() };
  current.promise = fetchLeaderboard().catch((error) => {
    if (entry === current) entry = old;
    if (old && Date.now() - old.time < maxStale) return old.promise;
    throw error;
  });
  entry = current;
  return current.promise;
}

module.exports = rankedLeaderboard;
