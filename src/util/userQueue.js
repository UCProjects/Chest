const Queue = require('queue');

const queueOptions = {
  concurrency: 1,
  timeout: 5000,
  autostart: true,
};

module.exports = (limit = 0) => {
  const users = {};
  function queue(user) {
    const key = user.id || user;
    const ret = users[key] || new Queue(queueOptions);
    if (!users[key]) {
      users[key] = ret;
      ret.on('timeout', next => next());
    }
    return ret;
  }
  return (user, cb) => {
    const q = queue(user);
    if (limit > 0 && q.length >= limit) return;
    const wrapper = () => cb();
    return new Promise((res, rej) => {
      const is = (job) => {
        const ret = job === wrapper;
        if (ret) allOff();
        return ret;
      };
      function success(result, job) {
        if (is(job)) res(result);
      }
      function error(err, job) {
        if (is(job)) rej(err);
      }
      function timeout(_, job) {
        if (is(job)) res('Action timed out');
      }
      function allOff() {
        q.off('success', success);
        q.off('error', error);
        q.off('timeout', timeout);
      }
      q.on('success', success);
      q.on('error', error);
      q.on('timeout', timeout);
      q.push(wrapper);
    });
  };
};