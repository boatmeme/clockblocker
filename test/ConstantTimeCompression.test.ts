import { ConstantTimeCompression, ClockTime, TimeWindow } from '../src/index';

describe(`ConstantTimeCompression class`, () => {
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
      const timewarp = new ConstantTimeCompression(timeWindow);
      expect(timewarp).toBeInstanceOf(ConstantTimeCompression);
    });
  });

  describe(`distortTime`, () => {
    describe('w/ defaults', () => {
      it(`effectively, a doubling`, () => {
        const timewarp = new ConstantTimeCompression(timeWindow);
        const result = timewarp.distortTime(500);
        expect(typeof result).toBe('number');
        expect(result).toEqual(500);
      });
    });
    describe('with `relativeDuration` specified', () => {
      it(`performs a constant compression, based on the ratio of real-to-relative duration`, () => {
        const timewarp = new ConstantTimeCompression(timeWindow, { milliseconds: 500 });
        const result = timewarp.distortTime(500);
        expect(typeof result).toBe('number');
        expect(result).toEqual(250);
      });
    });
  });
});
