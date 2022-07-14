import { ConstantTimeCompression } from '../src/index';

describe(`ConstantTimeCompression class`, () => {
  const start = {
    hour: 0,
    minute: 0,
    second: 1,
  };
  const end = {
    seconds: 2,
  };

  describe(`constructor`, () => {
    it('exists', () => {
      const timewarp = new ConstantTimeCompression(start, end);
      expect(timewarp).toBeInstanceOf(ConstantTimeCompression);
    });
  });

  describe(`distortTime`, () => {
    describe('w/ defaults', () => {
      it(`effectively, a doubling`, () => {
        const timewarp = new ConstantTimeCompression(start, end);
        const result = timewarp.distortTime(500);
        expect(typeof result).toBe('number');
        expect(result).toEqual(500);
      });
    });
    describe('with `relativeDuration` specified', () => {
      it(`performs a constant compression, based on the ratio of real-to-relative duration`, () => {
        const timewarp = new ConstantTimeCompression({ second: 4 }, { milliseconds: 10000 }, { seconds: 5 });
        const result = timewarp.distortTime(500);
        expect(typeof result).toBe('number');
        expect(result).toEqual(250);
      });
    });
  });
});
