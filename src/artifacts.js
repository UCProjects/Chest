const undercards = require('./undercards');
const login = require('./util/login');

const day = 24 * 60 * 1000;
let next = Date.now();

const artifacts = new Map([['', {}]]);

function fetch() {
  const password = process.env.UC_LOGIN;
  if (!password) return Promise.reject('No login');
  if (Date.now() < next) return Promise.resolve();
  return login(password)
    .then(Cookie => undercards.get('/DecksConfig', { headers: { Cookie } }))
    .then(({ data }) => {
      if (!data) throw new Error('Missing artifact data');
      artifacts.clear();
      next = Date.now() + day;

      JSON.parse(data.allArtifacts)
        .forEach(artifact => artifacts.set(artifact.id, artifact));
    });
}

module.exports = {
  fetch,
  artifacts,
};
