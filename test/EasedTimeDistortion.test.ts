import { EasedTimeDilation, EasedTimeCompression, EasedTimeDistortion } from '../src/index';

// `distortTime(length, offset)` returns the *integral* of the rate curve over the slice
// [offset, offset + length] of reference time -- the offset delta the fake clock accrues across
// that slice. These tests pin the curve's defining properties rather than hand-computed samples.
describe(`EasedTimeDistortion (raised-cosine bump)`, () => {
  const start = { hour: 1 };

  describe(`whole-window contract`, () => {
    it(`is a no-op across the whole window when relative and reference durations are equal`, () => {
      // referenceDuration defaults to relativeDuration => total delta is zero everywhere.
      const eased = new EasedTimeDilation(start, { seconds: 2 });
      expect(eased.distortTime(2000, 0)).toEqual(0);
      // ...and zero on every interior slice, not just on balance.
      expect(eased.distortTime(500, 750)).toEqual(0);
    });

    it(`accrues exactly (relative - reference) over the full window, same as the constant case`, () => {
      // 1s of fake time per 2s of real time => the window must still lose exactly 1s overall.
      const dilation = new EasedTimeDilation(start, { seconds: 1 }, { seconds: 2 });
      expect(dilation.distortTime(2000, 0)).toBeCloseTo(-1000, 6);

      // 4s of fake time per 2s of real time => the window must gain exactly 2s overall.
      const compression = new EasedTimeCompression(start, { seconds: 4 }, { seconds: 2 });
      expect(compression.distortTime(2000, 0)).toBeCloseTo(2000, 6);
    });
  });

  describe(`polling-frequency independence (integral, not point sample)`, () => {
    it(`sums to the same total whether the window is read whole or sliced finely`, () => {
      const ref = 2000;
      const dilation = new EasedTimeDilation(start, { seconds: 1 }, { milliseconds: ref });

      const whole = dilation.distortTime(ref, 0);

      let summed = 0;
      const step = 7; // deliberately not a divisor of ref, so slices are uneven
      for (let offset = 0; offset < ref; offset += step) {
        const length = Math.min(step, ref - offset);
        summed += dilation.distortTime(length, offset);
      }

      expect(summed).toBeCloseTo(whole, 6);
    });
  });

  describe(`rate eases to zero at the seams`, () => {
    it(`contributes almost nothing at the window edges and the most at the midpoint`, () => {
      const ref = 2000;
      const slice = 20; // small probe window
      const dilation = new EasedTimeDilation(start, { seconds: 1 }, { milliseconds: ref });

      const atStart = Math.abs(dilation.distortTime(slice, 0));
      const atMid = Math.abs(dilation.distortTime(slice, ref / 2 - slice / 2));
      const atEnd = Math.abs(dilation.distortTime(slice, ref - slice));

      // Near-zero rate at both seams -- this is what hides the transition.
      expect(atStart).toBeLessThan(atMid / 50);
      expect(atEnd).toBeLessThan(atMid / 50);
      // The bump is symmetric: equal probes at mirrored offsets accrue the same magnitude.
      expect(atStart).toBeCloseTo(atEnd, 9);
    });
  });

  describe(`subclassing for other curves`, () => {
    it(`honors a custom cumulative as long as it runs 0 -> 1`, () => {
      // A linear cumulative collapses the eased distortion back to the constant rate, proving
      // the integral machinery is shape-agnostic.
      class LinearEase extends EasedTimeDistortion {
        protected cumulativeFraction(u: number): number {
          return u;
        }
      }
      const linear = new LinearEase(start, { seconds: 1 }, { seconds: 2 });
      // Constant -250 over any 500ms slice, regardless of where it sits in the window.
      expect(linear.distortTime(500, 0)).toEqual(-250);
      expect(linear.distortTime(500, 1500)).toEqual(-250);
    });
  });
});
