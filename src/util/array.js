module.exports = (input) => {
  if (typeof input === 'string') {
    return [input];
  } else if (Array.isArray(input)) {
    return input;
  }
  return [];
};
