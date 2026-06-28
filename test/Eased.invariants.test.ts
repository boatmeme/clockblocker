import { Clock, EasedTimeCompression, EasedTimeDilation } from '../src/index';

// The eased distortions must satisfy the same Clock-level invariants as the constant family --
// polling-frequency independence and net-zero round trips -- *and* additionally remove the rate
// kink at every window seam, which is the whole point of easing.
describe(`Eased clock invariants`, () => {
  const hour = 1000 * 60 * 60;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // The README scenario, eased: lose 3h easing across 1am-7am, then claw 3h back easing across
  // 7am-10am, netting to zero by 10am.
  const buildDistortions = () => [
    new EasedTimeDilation({ hour: 1 }, { hours: 3 }, { hours: 6 }),
    new EasedTimeCompression({ hour: 7 }, { hours: 6 }, { hours: 3 }),
  ];

  describe(`polling-frequency independence`, () => {
    it(`reaches the same relative time whether polled once or every minute`, () => {
      const coarse = new Clock(buildDistortions());
      jest.setSystemTime(12 * hour);
      const coarseResult = coarse.relativeTimeInMillis;

      const fine = new Clock(buildDistortions());
      let fineResult = 0;
      for (let t = 0; t <= 12 * hour; t += 60 * 1000) {
        jest.setSystemTime(t);
        fineResult = fine.relativeTimeInMillis;
      }

      // The slice integral is exact, so breaking the span into minutes must not drift from the
      // single-poll result.
      expect(fineResult).toBeCloseTo(coarseResult, 6);
      // ...and both land back in sync once the windows have netted out.
      expect(fineResult).toBeCloseTo(12 * hour, 6);
    });
  });

  describe(`round-trip net-zero`, () => {
    it(`returns to perfect sync after the eased dilation is compensated by the compression`, () => {
      const clock = new Clock(buildDistortions());

      // Symmetric bump: at the midpoint of the 6h dilation (4am) exactly half the 3h loss has
      // accrued, so the clock reads 1.5h behind -- same checkpoint value as the constant case,
      // because the curve is symmetric about the midpoint.
      jest.setSystemTime(4 * hour);
      expect(clock.relativeTimeInMillis - 4 * hour).toBeCloseTo(-1.5 * hour, 6);

      // Full 3h loss banked at the seam.
      jest.setSystemTime(7 * hour);
      expect(clock.relativeTimeInMillis - 7 * hour).toBeCloseTo(-3 * hour, 6);

      // Halfway back through the compression (8.5am): half of the 3h reclaimed.
      jest.setSystemTime(8.5 * hour);
      expect(clock.relativeTimeInMillis - 8.5 * hour).toBeCloseTo(-1.5 * hour, 6);

      // Back to exact sync by 10am, and no residual drift afterward.
      jest.setSystemTime(10 * hour);
      expect(clock.relativeTimeInMillis).toBeCloseTo(clock.referenceTimeInMillis, 6);

      jest.setSystemTime(20 * hour);
      expect(clock.relativeTimeInMillis).toBeCloseTo(clock.referenceTimeInMillis, 6);
    });
  });

  describe(`no rate kink at the seams`, () => {
    // Measures the offset change accrued over a one-minute poll straddling an instant -- a proxy
    // for the instantaneous rate there.
    const rateAround = (instant: number) => {
      // Anchor the run at t=0 so the time-of-day windows resolve to [1am, 10am) of day 0,
      // regardless of what order these probes run in.
      jest.setSystemTime(0);
      const clock = new Clock(buildDistortions());
      jest.setSystemTime(instant - 30 * 1000);
      const before = clock.offset;
      jest.setSystemTime(instant + 30 * 1000);
      return clock.offset - before;
    };

    it(`runs at ~normal speed at the window boundaries but is distorting hardest mid-window`, () => {
      const atDilationStart = Math.abs(rateAround(1 * hour)); // 1am seam
      const atSeam = Math.abs(rateAround(7 * hour)); // 7am dilation->compression seam
      const atEnd = Math.abs(rateAround(10 * hour)); // 10am seam
      const midDilation = Math.abs(rateAround(4 * hour)); // deepest slowdown

      // At every seam the eased clock is moving at essentially 1:1 -- no detectable kink --
      // whereas the constant version would jump to half/double speed at exactly these instants.
      expect(atDilationStart).toBeLessThan(midDilation / 50);
      expect(atSeam).toBeLessThan(midDilation / 50);
      expect(atEnd).toBeLessThan(midDilation / 50);
    });
  });
});
