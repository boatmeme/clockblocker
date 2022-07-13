import { ConstantTimeDilation, ClockTime, TimeWindow } from '../src/index';

describe(`ConstantTimeDilation class`, () => {
  const start = new ClockTime({
    hour: 0,
    minute: 0,
    second: 1,
  });
  const end = new ClockTime({
    hour: 0,
    minute: 0,
    second: 2,
  });
  const timeWindow = new TimeWindow(start, end);

  describe(`constructor`, () => {
    it('exists', () => {
      const timewarp = new ConstantTimeDilation(timeWindow);
      expect(timewarp).toBeInstanceOf(ConstantTimeDilation);
    });
  });

  describe(`distortTime`, () => {
    describe('w/ defaults', () => {
      it(`effectively, a pause`, () => {
        const timewarp = new ConstantTimeDilation(timeWindow);
        const result = timewarp.distortTime(500);
        expect(typeof result).toBe('number');
        expect(result).toEqual(-500);
      });
    });
    describe('with `relativeDuration` specified', () => {
      it(`performs a constant dilation, based on the ratio of real-to-relative duration`, () => {
        const timewarp = new ConstantTimeDilation(timeWindow, { seconds: 2 });
        const result = timewarp.distortTime(500);
        expect(typeof result).toBe('number');
        expect(result).toEqual(-250);
      });
    });
  });
});
