const { expect } = require('chai');
const {
  divisions, indexOf, minElo, nextElo, width, progress,
} = require('../../src/util/divisions');

describe('divisions', () => {
  describe('indexOf', () => {
    it('finds a division', () => {
      expect(indexOf('COPPER_III')).to.equal(0);
      expect(indexOf('LEGEND')).to.equal(divisions.length - 1);
    });

    it('normalizes input', () => {
      expect(indexOf('copper iii')).to.equal(0);
      expect(indexOf(' Ultimate_Master ')).to.equal(indexOf('ULTIMATE_MASTER'));
    });

    it('falls back to the lowest division', () => {
      expect(indexOf('NOPE')).to.equal(0);
      expect(indexOf()).to.equal(0);
    });
  });

  describe('elo thresholds', () => {
    it('steps by 30 below master', () => {
      expect(minElo('COPPER_III')).to.equal(1100);
      expect(minElo('COPPER_II')).to.equal(1130);
      expect(minElo('DIAMOND_I')).to.equal(1520);
      expect(width('COPPER_III')).to.equal(30);
      expect(width('DIAMOND_I')).to.equal(30);
    });

    it('widens through the master tiers', () => {
      expect(minElo('MASTER')).to.equal(1550);
      expect(minElo('HIGH_MASTER')).to.equal(1650);
      expect(minElo('ULTIMATE_MASTER')).to.equal(1800);
      expect(minElo('LEGEND')).to.equal(2000);
      expect(width('MASTER')).to.equal(100);
      expect(width('HIGH_MASTER')).to.equal(150);
      expect(width('ULTIMATE_MASTER')).to.equal(200);
    });

    it('has no ceiling above legend', () => {
      expect(nextElo('LEGEND')).to.equal(minElo('LEGEND'));
      expect(width('LEGEND')).to.equal(0);
    });
  });

  describe('progress', () => {
    it('is 0 at the division floor', () => {
      expect(progress('COPPER_III', 0)).to.equal(0);
      expect(progress('MASTER', 0)).to.equal(0);
    });

    it('is halfway between floors', () => {
      expect(progress('COPPER_III', 15)).to.equal(50);
      expect(progress('MASTER', 50)).to.equal(50);
      expect(progress('ULTIMATE_MASTER', 100)).to.equal(50);
    });

    it('clamps out of range values', () => {
      expect(progress('COPPER_III', -50)).to.equal(0);
      expect(progress('COPPER_III', 9999)).to.equal(100);
    });

    it('is undefined for legend', () => {
      expect(progress('LEGEND', 182)).to.equal(undefined);
    });
  });
});
