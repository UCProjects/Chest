class Count {
  constructor(value = 0, total = 0) {
    this.value = value;
    this.total = total;
  }
  increment() {
    this.value += 1;
    this.total += 1;
  }
  merge(other = new Count()) {
    this.value += other.value;
    this.total += other.total;
  }
  toString(simple = true) {
    return `${this.value}${simple ? '' : `/${this.total}`}`;
  }
}

class CardEntry {
  constructor({
    s: shiny = 0,
    r: regular = 0,
    sT: shinyTotal = 0,
    rT: regularTotal = 0,
  } = {}) {
    this.shiny = new Count(shiny, shinyTotal);
    this.regular = new Count(regular, regularTotal);
  }
  get total() {
    return this.shiny.total + this.regular.total;
  }
  toJSON() {
    const ret = {};
    if (this.shiny.total) {
      ret.s = this.shiny.value;
      ret.sT = this.shiny.total;
    }
    if (this.regular.total) {
      ret.r = this.regular.value;
      ret.rT = this.regular.total;
    }
    return ret;
  }
  merge(other = new CardEntry()) {
    this.shiny.merge(other.shiny);
    this.regular.merge(other.regular);
  }
  toString(simple = true) {
    const ret = [];
    if (this.shiny.total) {
      ret.push(`Shiny: ${this.shiny.toString(simple)}`);
    }
    if (!simple && !ret.length || this.regular.total) {
      ret.push(`Normal: ${this.regular.toString(simple)}`);
    }
    return ret.join('\n');
  }
}

module.exports = CardEntry;
