import { Clock, ConstantTimeCompression, ConstantTimeDilation } from '../src/index';

// The library performs no validation of distortion parameters (see README roadmap #2).
// These tests characterize what currently happens for degenerate inputs so the behavior is
// at least visible, and so a future validating implementation has a baseline to change.
describe(`degenerate distortion durations`, () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe(`distortTime`, () => {
    it(`returns Infinity when the reference duration is zero (division by zero)`, () => {
      const distortion = new ConstantTimeCompression({ hour: 1 }, { hours: 2 }, { hours: 0 });
      expect(distortion.distortTime(500)).toBe(Infinity);
    });

    it(`returns NaN when both durations are zero`, () => {
      const distortion = new ConstantTimeCompression({ hour: 1 }, { hours: 0 }, { hours: 0 });
      expect(Number.isNaN(distortion.distortTime(500))).toBe(true);
    });

    it(`exaggerates dilation for a negative relative duration (no sign validation)`, () => {
      // -1h relative over 2h reference => ratio -0.5 => offset delta of -1.5x real time.
      const distortion = new ConstantTimeDilation({ hour: 1 }, { hours: -1 }, { hours: 2 });
      expect(distortion.distortTime(500)).toEqual(-750);
    });
  });

  describe(`Clock`, () => {
    it(`poisons relative time with NaN once a zero-reference-duration window is reached`, () => {
      const hour = 1000 * 60 * 60;
      // A zero-length window at 1am: the division by zero yields an Infinity ratio, and the
      // zero-length elapsed slice (0 * Infinity) corrupts the accumulated offset to NaN --
      // which then permanently poisons every subsequent reading.
      const clock = new Clock([new ConstantTimeCompression({ hour: 1 }, { hours: 2 }, { hours: 0 })]);

      jest.setSystemTime(0);
      expect(clock.relativeTimeInMillis).toEqual(0); // before the window: still fine

      jest.setSystemTime(2 * hour); // past the empty window
      expect(Number.isNaN(clock.relativeTimeInMillis)).toBe(true);
    });
  });
});
