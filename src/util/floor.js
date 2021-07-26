module.exports = (num, dec = 2, pad = false) => {
  const ret = Number(`${Math.floor(`${num}e${dec}`)}e-${dec}`);
  if (pad) {
    return ret.toFixed(2);
  }
  return ret;
};
