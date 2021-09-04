function validate(haystack, needle, strict = true) {
  if (typeof needle === 'string') {
    if (Array.isArray(haystack)) return !haystack.length || haystack.some(key => check(key, needle, strict));
    else if (typeof haystack === 'string') return check(haystack, needle, strict);
  } else if (Array.isArray(needle)) {
    return !needle.length || needle.some(value => validate(haystack, value, strict));
  }
  return true;
}

function check(one = '', two = '', strict = true) {
  one = one.toLowerCase();
  two = two.toLowerCase();
  return strict ? one === two : one.includes(two);
}

module.exports = validate;
