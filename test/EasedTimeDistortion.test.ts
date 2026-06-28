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
      // offset defaults to 0, same as passing it explicitly.
      expect(dilation.distortTime(2000)).toBeCloseTo(-1000, 6);

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

  describe(`ramp shaping`, () => {
    const ref = 6000;
    // Loses 3s over a 6s window (avg half-speed) whatever the ramp -- only the distribution moves.
    const build = (options?: object) =>
      new EasedTimeDilation(start, { milliseconds: 3000 }, { milliseconds: ref }, options);

    it(`preserves the whole-window total for any ramp, symmetric or asymmetric`, () => {
      expect(build().distortTime(ref, 0)).toBeCloseTo(-3000, 6); // default bump
      expect(build({ ramp: 0.1 }).distortTime(ref, 0)).toBeCloseTo(-3000, 6);
      expect(build({ rampIn: 0.3, rampOut: 0.05 }).distortTime(ref, 0)).toBeCloseTo(-3000, 6);
      expect(build({ rampIn: 0.2, rampOut: 0 }).distortTime(ref, 0)).toBeCloseTo(-3000, 6);
    });

    it(`holds a constant rate across the plateau and eases at the seams`, () => {
      const eased = build({ ramp: 0.1 }); // ramps over the outer 10%, flat across the middle 80%
      // Two equal probes well inside the plateau accrue the same amount: the rate is constant there.
      const a = eased.distortTime(500, ref * 0.3);
      const b = eased.distortTime(500, ref * 0.6);
      expect(a).toBeCloseTo(b, 9);

      // The plateau rate is steeper than the window average (area 0.9 => 1/0.9x), and the seams
      // accrue almost nothing -- the easing hides the transition.
      const plateauRate = Math.abs(a) / 500;
      expect(plateauRate).toBeCloseTo(Math.abs(-3000) / ref / 0.9, 6);
      const atSeam = Math.abs(eased.distortTime(20, 0));
      expect(atSeam).toBeLessThan(Math.abs(a) / 20);
    });

    it(`accepts a Duration ramp equivalently to the matching fraction`, () => {
      // 0.6s of a 6s window is the 0.1 fraction; both must produce identical curves.
      const byFraction = build({ ramp: 0.1 });
      const byDuration = build({ ramp: { milliseconds: 600 } });
      for (const offset of [0, 600, 1500, 3000, 4500, 5400, 6000]) {
        expect(byDuration.distortTime(100, Math.min(offset, ref - 100))).toBeCloseTo(
          byFraction.distortTime(100, Math.min(offset, ref - 100)),
          9,
        );
      }
    });

    it(`lets rampIn / rampOut override the symmetric shorthand per side`, () => {
      // rampOut omitted falls back to ramp (0.2), CSS-padding style -- not to zero.
      const padded = build({ ramp: 0.2, rampIn: 0.4 });
      const explicit = build({ rampIn: 0.4, rampOut: 0.2 });
      for (const offset of [0, 1000, 3000, 5000, 5900]) {
        expect(padded.distortTime(50, offset)).toBeCloseTo(explicit.distortTime(50, offset), 9);
      }
    });

    it(`leaves a hard seam where a ramp is zero`, () => {
      // rampOut: 0 means no roll-off -- the plateau runs at full rate right up to the end, so the
      // final slice accrues far more than the eased opening slice.
      const hardStop = build({ rampIn: 0.2, rampOut: 0 });
      const atStart = Math.abs(hardStop.distortTime(20, 0));
      const atEnd = Math.abs(hardStop.distortTime(20, ref - 20));
      expect(atStart).toBeLessThan(atEnd / 20);
    });

    it(`clamps overlapping ramps down to a tent instead of throwing`, () => {
      // 0.8 + 0.8 can't fit; scaled proportionally to 0.5 + 0.5, which is the symmetric bump.
      const clamped = build({ rampIn: 0.8, rampOut: 0.8 });
      const bump = build();
      for (const offset of [0, 1500, 3000, 4500, 5900]) {
        expect(clamped.distortTime(50, offset)).toBeCloseTo(bump.distortTime(50, offset), 9);
      }
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
