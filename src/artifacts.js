const config = require('./config');
const undercards = require('./undercards');
const login = require('./util/login');

const day = 24 * 60 * 1000;
let next = Date.now();

const artifacts = new Map([['', {}]]);

function set(artifact) {
  artifacts.set(artifact.id, artifact);
}

config.get('artifacts', []).forEach(set);

function fetch() {
  const password = process.env.UC_LOGIN;
  if (!password) return Promise.reject('No login');
  if (Date.now() < next) return Promise.resolve();
  return login(password)
    .then(Cookie => undercards.get('/DecksConfig', { headers: { Cookie } }))
    .then(({ data }) => {
      if (!data?.allArtifacts) throw new Error('Missing artifact data');
      artifacts.clear();
      next = Date.now() + day;

      const artifactData = JSON.parse(data.allArtifacts);
      artifactData.forEach(artifact => artifacts.set(artifact.id, artifact));
      config.set('artifacts', artifactData);
    });
}

module.exports = {
  fetch,
  artifacts,
};
