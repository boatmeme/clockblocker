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

  // `distortTime(dt)` returns the *offset delta* the distortion contributes for `dt`
  // milliseconds of real time — how far the fake clock moves relative to real time.
  describe(`distortTime`, () => {
    describe('w/ defaults', () => {
      it(`is a no-op when relative and reference durations are equal`, () => {
        // referenceDuration defaults to relativeDuration, so time passes 1-to-1.
        const timewarp = new ConstantTimeCompression(start, end);
        const result = timewarp.distortTime(500);
        expect(typeof result).toBe('number');
        expect(result).toEqual(0);
      });
    });
    describe('with `relativeDuration` specified', () => {
      it(`speeds the clock up by the ratio of relative-to-reference duration`, () => {
        // 10s of fake time per 5s of real time (double speed) => over 500ms real the fake
        // clock advances 1000ms, i.e. it pulls 500ms ahead of real time.
        const timewarp = new ConstantTimeCompression({ second: 4 }, { milliseconds: 10000 }, { seconds: 5 });
        const result = timewarp.distortTime(500);
        expect(typeof result).toBe('number');
        expect(result).toEqual(500);
      });
    });
  });
});
