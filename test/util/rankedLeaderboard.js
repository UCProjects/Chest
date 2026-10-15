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
  let handler;
  let loginHandler;
  let logins;
  let controllers;
  let rankedLeaderboard;
  const realTimeout = AbortSignal.timeout;

  const body = (version) => ({ data: { leaderboard: JSON.stringify([{ id: 1, version }, { id: 2 }]) } });

  function deferred() {
    const result = {};
    result.promise = new Promise((resolve, reject) => {
      result.resolve = resolve;
      result.reject = reject;
    });
    return result;
  }

  const tick = () => new Promise((resolve) => {
    setImmediate(resolve);
  });

  const hang = ({ signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason));
  });

  function load() {
    const stubs = {
      'undercards.js': {
        get: async (...args) => {
          requests += 1;
          if (handler) return handler(...args);
          if (fail) throw new Error('down');
          return body(requests);
        },
      },
      'util/login.js': async (...args) => {
        logins.push(args);
        if (loginHandler) return loginHandler(...args);
        return 'cookie';
      },
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
    handler = null;
    loginHandler = null;
    logins = [];
    controllers = [];
    Date.now = () => realNow() + offset;
    AbortSignal.timeout = () => {
      const controller = new AbortController();
      controllers.push(controller);
      return controller.signal;
    };
    rankedLeaderboard = load();
  });

  afterEach(() => {
    Date.now = realNow;
    AbortSignal.timeout = realTimeout;
    targets.forEach((target) => delete require.cache[path.join(root, target)]);
  });

  it('shares one timeout signal between the login and the request', async () => {
    let requestConfig;
    handler = async (url, config) => {
      requestConfig = config;
      return body(1);
    };
    await rankedLeaderboard();
    expect(controllers).to.have.length(1);
    expect(logins[0][1].signal).to.equal(controllers[0].signal);
    expect(requestConfig.signal).to.equal(controllers[0].signal);
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

  describe('when the timeout aborts', () => {
    async function failure(promise) {
      try {
        await promise;
      } catch (e) {
        return e;
      }
      return undefined;
    }

    it('rejects when the login hangs', async () => {
      loginHandler = (body_, config) => hang(config);
      const pending = rankedLeaderboard();
      await tick();
      controllers[0].abort(new Error('timed out'));
      const error = await failure(pending);
      expect(error).to.be.an('error').with.property('message', 'timed out');
      expect(requests).to.equal(0);
    });

    it('rejects when the request hangs', async () => {
      handler = (url, config) => hang(config);
      const pending = rankedLeaderboard();
      await tick();
      controllers[0].abort(new Error('timed out'));
      const error = await failure(pending);
      expect(error).to.be.an('error').with.property('message', 'timed out');
    });

    it('serves the previous result after the abort', async () => {
      const first = await rankedLeaderboard();
      offset += 31 * second;
      loginHandler = (body_, config) => hang(config);
      const pending = rankedLeaderboard();
      await tick();
      controllers[1].abort(new Error('timed out'));
      expect(await pending).to.equal(first);
    });

    it('does not hold on to an aborted request', async () => {
      loginHandler = (body_, config) => hang(config);
      const pending = rankedLeaderboard();
      await tick();
      controllers[0].abort(new Error('timed out'));
      await failure(pending);
      loginHandler = null;
      const leaderboard = await rankedLeaderboard();
      expect(leaderboard).to.have.length(2);
    });
  });

  describe('when a refresh outlives its ttl', () => {
    it('does not let a stale fallback outlive the ten minute limit', async () => {
      await rankedLeaderboard();
      offset += 31 * second;
      const slow = deferred();
      handler = () => slow.promise;
      const slowCall = rankedLeaderboard();
      offset += 31 * second;
      const failing = deferred();
      handler = () => failing.promise;
      const failingCall = rankedLeaderboard();
      slow.reject(new Error('down'));
      failing.reject(new Error('down'));
      await Promise.all([slowCall, failingCall]);

      offset += 10 * minute - 40 * second;
      handler = () => Promise.reject(new Error('down'));
      let error;
      try {
        await rankedLeaderboard();
      } catch (e) {
        error = e;
      }
      expect(error).to.be.an('error').with.property('message', 'down');
    });
  });
});
