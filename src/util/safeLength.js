function getSafeLength(text = '', length = 2048, splitter = ',') {
  const len = text.length;
  if (len > length) {
    const pointer = text.lastIndexOf(splitter, length + 1);
    return pointer > 0 ? pointer - 1 : length;
  }
  return len;
}

module.exports = getSafeLength;
