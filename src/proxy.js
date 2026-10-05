const proxy = process.env.ALL_PROXY;

function createAgent() {
  if (!proxy) return undefined;
  const { SocksProxyAgent } = require('socks-proxy-agent');
  return new SocksProxyAgent(proxy, { keepAlive: true });
}

function browserArgs() {
  if (!proxy) return [];
  const { host } = new URL(proxy.replace(/^socks5h?:/, 'http:'));
  return [`--proxy-server=socks5://${host}`];
}

module.exports = {
  agent: createAgent(),
  browserArgs,
};
