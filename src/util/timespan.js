const minute = 60,
      hour   = 3600,
      day    = 86400,
      month  = 2592000,
      year   = 31536000;

module.exports = (milliseconds) => {
  const ret = [];
  let seconds = Math.floor(milliseconds / 1000);

  const years = Math.floor(seconds / year);
  if (years) ret.push(`${years}Y`);
  seconds -= years * year;

  const months = Math.floor(seconds / month);
  if (months) ret.push(`${months}M`);
  seconds -= months * month;

  const days = Math.floor(seconds / day);
  if (days) ret.push(`${days}D`);
  seconds -= days * day;

  const hours = Math.floor(seconds / hour);
  if (hours) ret.push(`${hours}h`);
  seconds -= hours * hour;

  const mins = Math.floor(seconds / minute);
  if (hours || mins) ret.push(`${mins}m`);
  seconds -= mins * minute;

  ret.push(`${seconds}s`);

  return ret.join(' ');
};
