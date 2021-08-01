module.exports = (array = [], size = 10) => array.reduce((ret = [], item, i) => {
  const index = Math.floor(i / size);
  const list = ret[index] || [];
  if (!list.length) ret[index] = list;
  list.push(item);
  return ret;
}, []);
