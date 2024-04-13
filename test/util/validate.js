const { expect } = require("chai");
const validate = require("../../src/util/validate");

const tests = [{
  name: 'Basic strings equal',
  value: validate('test', 'test'),
  expected: true,
}, {
  name: 'Basic strings unequal',
  value: validate('foo', 'bar'),
  expected: false,
}, {
  name: 'undefined needle passes',
  value: validate('foo', undefined),
  expected: true,
}, {
  name: 'undefined haystack passes',
  value: validate(undefined, 'test'),
  expected: true,
}, {
  name: 'non-strict undefined haystack passes',
  value: validate(undefined, 'test', false),
  expected: true,
}, {
  name: 'Needle in [haystack]',
  value: validate(['Bar', 'Foo', 'Bazz'], 'Foo'),
  expected: true,
}, {
  name: '[Needle] contains haystack',
  value: validate('Foo', ['Bar', 'Foo', 'Bazz']),
  expected: true,
}, {
  name: 'Undefined passes',
  value: validate(),
  expected: true,
}, {
  name: '[Needle] contains [haystack]',
  value: validate(['Foo', 'Bar', 'Bazz'], ['Alpha', 'Beta', 'Bar']),
  expected: true,
}, {
  name: '[Needle] does not contain [haystack]',
  value: validate(['Foo', 'Bar', 'Bazz'], ['Alpha', 'Beta']),
  expected: false,
}, {
  name: 'Empty [needle] passes',
  value: validate('foo', []),
  expected: true,
}, {
  name: 'Empty [haystack] passes',
  value: validate([], 'foo'),
  expected: true,
}, {
  name: 'false needle passes',
  value: validate('string', false),
  expected: true,
}, {
  name: 'non-strict false needle passes',
  value: validate('string', false, false),
  expected: true,
}, {
  name: 'false haystack passes',
  value: validate(false, 'foo'),
  expected: true,
}, {
  name: 'empty string haystack fails',
  value: validate('', 'needle'),
  expected: false,
}, {
  name: 'empty string needle fails',
  value: validate('haystack', ''),
  expected: false,
}, {
  name: 'non-strict empty string haystack fails',
  value: validate('', 'needle', false),
  expected: false,
}, {
  name: 'non-strict empty string needle passes',
  // non-strict requires truthy values
  value: validate('haystack', '', false),
  expected: true,
}, {
  name: '',
  value: validate(),
  expected: true,
}];

describe('Validate', () => {
  tests.forEach(({ name, value, expected }) => {
    if (!name) return;
    it(name, () => {
      expect(value).to.equal(expected);
    });
  });
});
