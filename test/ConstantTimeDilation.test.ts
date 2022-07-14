import { ConstantTimeDilation } from '../src/index';

describe(`ConstantTimeDilation class`, () => {
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
      const timewarp = new ConstantTimeDilation(start, end);
      expect(timewarp).toBeInstanceOf(ConstantTimeDilation);
    });
  });

  describe(`distortTime`, () => {
    describe('w/ defaults', () => {
      it(`effectively, a pause`, () => {
        const timewarp = new ConstantTimeDilation(start, end);
        const result = timewarp.distortTime(500);
        expect(typeof result).toBe('number');
        expect(result).toEqual(-500);
      });
    });
    describe('with `relativeDuration` specified', () => {
      it(`performs a constant dilation, based on the ratio of real-to-relative duration`, () => {
        const timewarp = new ConstantTimeDilation(start, { seconds: 1 }, end);
        const result = timewarp.distortTime(500);
        expect(typeof result).toBe('number');
        expect(result).toEqual(-250);
      });
    });
  });
});
