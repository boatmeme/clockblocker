import { Clock, ConstantTimeCompression, ConstantTimeDilation } from '../src/index';

// Properties that must hold for any combination of constant distortions, regardless of how
// the clock happens to be polled. These guard the offset-accumulation math in `Clock` as a
// whole, rather than any single hand-computed value.
describe(`Clock invariants`, () => {
  const hour = 1000 * 60 * 60;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // The README example: half-speed from 1am-7am, double-speed from 7am-10am, which nets out
  // to zero distortion by 10am.
  const buildDistortions = () => [
    new ConstantTimeDilation({ hour: 1 }, { hours: 3 }, { hours: 6 }),
    new ConstantTimeCompression({ hour: 7 }, { hours: 6 }, { hours: 3 }),
  ];

  describe(`polling-frequency independence`, () => {
    it(`reaches the same relative time whether polled once or every minute`, () => {
      // Polled exactly once, after every window has elapsed.
      const coarse = new Clock(buildDistortions());
      jest.setSystemTime(12 * hour);
      const coarseResult = coarse.relativeTimeInMillis;

      // Polled every minute across the same span.
      const fine = new Clock(buildDistortions());
      let fineResult = 0;
      for (let t = 0; t <= 12 * hour; t += 60 * 1000) {
        jest.setSystemTime(t);
        fineResult = fine.relativeTimeInMillis;
      }

      // Because every distortion is linear, the accumulated offset must not depend on how
      // many slices the interval was broken into.
      expect(fineResult).toEqual(coarseResult);
      expect(fineResult).toEqual(12 * hour); // the distortions cancel out by noon
    });
  });

  describe(`order independence`, () => {
    it(`produces the same relative time regardless of the order of the distortions`, () => {
      const [dilation, compression] = buildDistortions();
      const forward = new Clock([dilation, compression]);
      const reversed = new Clock([compression, dilation]);

      // Walk both clocks through the same hourly checkpoints; their offsets are summed, so
      // the array order must not matter at any point in time.
      for (let h = 1; h <= 12; h++) {
        jest.setSystemTime(h * hour);
        expect(reversed.relativeTimeInMillis).toEqual(forward.relativeTimeInMillis);
      }
    });
  });
});
