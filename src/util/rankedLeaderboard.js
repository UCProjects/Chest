const undercards = require('../undercards');
const login = require('./login');

const ttl = 30 * 1000;
const maxStale = 10 * 60 * 1000;
const requestTimeout = 15 * 1000;

let entry = null;

async function fetchLeaderboard() {
  const signal = AbortSignal.timeout(requestTimeout);
  const Cookie = await login(process.env.UC_LOGIN, { signal });
  const { data } = await undercards.get('/Leaderboard', {
    headers: { Cookie },
    params: { action: 'ranked' },
    signal,
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
    if (old && Date.now() - old.time < maxStale) {
      current.time = old.time;
      if (entry === current) entry = old;
      return old.promise;
    }
    if (entry === current) entry = old;
    throw error;
  });
  entry = current;
  return current.promise;
}

module.exports = rankedLeaderboard;
