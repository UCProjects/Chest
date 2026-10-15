const path = require('path');
const { expect } = require('chai');

const root = path.resolve(__dirname, '../../src');
const targets = ['util/rankedLeaderboard.js', 'undercards.js', 'util/login.js'];

const second = 1000;
const minute = 60 * second;

describe('rankedLeaderboard', () => {
  const realNow = Date.now;
  let offset;
  let requests;
  let fail;
  let rankedLeaderboard;

  function load() {
    const stubs = {
      'undercards.js': {
        get: async () => {
          requests += 1;
          if (fail) throw new Error('down');
          return { data: { leaderboard: JSON.stringify([{ id: 1, version: requests }, { id: 2 }]) } };
        },
      },
      'util/login.js': async () => 'cookie',
    };
    targets.forEach((target) => delete require.cache[path.join(root, target)]);
    Object.entries(stubs).forEach(([target, exports]) => {
      const filename = path.join(root, target);
      require.cache[filename] = { id: filename, filename, loaded: true, exports };
    });
    return require(path.join(root, 'util/rankedLeaderboard.js'));
  }

  beforeEach(() => {
    offset = 0;
    requests = 0;
    fail = false;
    Date.now = () => realNow() + offset;
    rankedLeaderboard = load();
  });

  afterEach(() => {
    Date.now = realNow;
    targets.forEach((target) => delete require.cache[path.join(root, target)]);
  });

  it('numbers each entry with its rank', async () => {
    const leaderboard = await rankedLeaderboard();
    expect(leaderboard.map(({ rank }) => rank)).to.deep.equal([0, 1]);
  });

  it('shares one request between concurrent callers', async () => {
    const [a, b] = await Promise.all([rankedLeaderboard(), rankedLeaderboard()]);
    expect(a).to.equal(b);
    expect(requests).to.equal(1);
  });

  it('serves the cached result inside the ttl', async () => {
    const first = await rankedLeaderboard();
    offset += 29 * second;
    expect(await rankedLeaderboard()).to.equal(first);
    expect(requests).to.equal(1);
  });

  it('fetches again once the ttl has passed', async () => {
    const first = await rankedLeaderboard();
    offset += 31 * second;
    const next = await rankedLeaderboard();
    expect(next).to.not.equal(first);
    expect(requests).to.equal(2);
  });

  describe('when the request fails', () => {
    it('rejects when there is nothing cached', async () => {
      fail = true;
      let error;
      try {
        await rankedLeaderboard();
      } catch (e) {
        error = e;
      }
      expect(error).to.be.an('error').with.property('message', 'down');
    });

    it('does not cache the failure', async () => {
      fail = true;
      await rankedLeaderboard().catch(() => {});
      fail = false;
      const leaderboard = await rankedLeaderboard();
      expect(leaderboard).to.have.length(2);
      expect(requests).to.equal(2);
    });

    it('serves the previous result', async () => {
      const first = await rankedLeaderboard();
      offset += 31 * second;
      fail = true;
      expect(await rankedLeaderboard()).to.equal(first);
      expect(requests).to.equal(2);
    });

    it('tries again on the next call and keeps serving the previous result', async () => {
      const first = await rankedLeaderboard();
      offset += 31 * second;
      fail = true;
      await rankedLeaderboard();
      expect(await rankedLeaderboard()).to.equal(first);
      expect(requests).to.equal(3);
    });

    it('recovers with fresh data once requests succeed again', async () => {
      const first = await rankedLeaderboard();
      offset += 31 * second;
      fail = true;
      await rankedLeaderboard();
      fail = false;
      const next = await rankedLeaderboard();
      expect(next).to.not.equal(first);
      expect(next[0].version).to.equal(3);
    });

    it('rejects when the previous result is older than ten minutes', async () => {
      await rankedLeaderboard();
      offset += 10 * minute + second;
      fail = true;
      let error;
      try {
        await rankedLeaderboard();
      } catch (e) {
        error = e;
      }
      expect(error).to.be.an('error').with.property('message', 'down');
    });

    it('still serves a result just inside ten minutes', async () => {
      const first = await rankedLeaderboard();
      offset += 10 * minute - second;
      fail = true;
      expect(await rankedLeaderboard()).to.equal(first);
    });
  });
});
