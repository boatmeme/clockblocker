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

  // `distortTime(dt)` returns the *offset delta* the distortion contributes for `dt`
  // milliseconds of real time — how far the fake clock moves relative to real time.
  describe(`distortTime`, () => {
    describe('w/ defaults', () => {
      it(`is a no-op when relative and reference durations are equal`, () => {
        // referenceDuration defaults to relativeDuration, so time passes 1-to-1.
        const timewarp = new ConstantTimeDilation(start, end);
        const result = timewarp.distortTime(500);
        expect(typeof result).toBe('number');
        expect(result).toEqual(0);
      });
    });
    describe('with `relativeDuration` specified', () => {
      it(`slows the clock by the ratio of relative-to-reference duration`, () => {
        // 1s of fake time per 2s of real time => over 500ms real the fake clock advances
        // 250ms, i.e. it falls 250ms behind real time.
        const timewarp = new ConstantTimeDilation(start, { seconds: 1 }, end);
        const result = timewarp.distortTime(500);
        expect(typeof result).toBe('number');
        expect(result).toEqual(-250);
      });
      it(`fully pauses the clock when no relative time passes`, () => {
        // 0s of fake time per 2s of real time => the fake clock is frozen, so the offset
        // must cancel the entire 500ms of real time.
        const timewarp = new ConstantTimeDilation(start, { seconds: 0 }, end);
        const result = timewarp.distortTime(500);
        expect(result).toEqual(-500);
      });
    });
  });
});
