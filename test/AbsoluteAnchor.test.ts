import { Clock, ConstantTimeDilation } from '../src/index';

// An absolute-anchored window is pinned to a fixed real-world instant, independent of when the
// Clock was constructed -- and, being plain instant arithmetic, it can span many days.
describe(`absolute anchor`, () => {
  const hour = 60 * 60 * 1000;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const buildClockAt = (constructAtMs: number, distortions: ConstructorParameters<typeof Clock>[0]) => {
    jest.setSystemTime(constructAtMs);
    return new Clock(distortions);
  };

  it(`distorts across its fixed calendar window regardless of when the clock was built`, () => {
    // Half speed over the 6 real hours from 2026-12-25T01:00Z.
    const distortions = () => [
      new ConstantTimeDilation({ absolute: new Date(`2026-12-25T01:00:00Z`) }, { hours: 3 }, { hours: 6 }),
    ];

    const lostByWindowEnd = (constructAtMs: number) => {
      const clock = buildClockAt(constructAtMs, distortions());
      jest.setSystemTime(Date.UTC(2026, 11, 25, 7)); // window end, 07:00Z
      return clock.relativeTimeInMillis - clock.referenceTimeInMillis;
    };

    // Built a minute before the window, or a full day before -- same fixed window, same -3h.
    expect(lostByWindowEnd(Date.UTC(2026, 11, 25, 0, 59))).toEqual(-3 * hour);
    expect(lostByWindowEnd(Date.UTC(2026, 11, 24, 0))).toEqual(-3 * hour);
  });

  it(`integrates a genuine multi-day span exactly once across sparse reads`, () => {
    // Half speed for 72 real hours (3 days) starting 2026-12-25T00:00Z => loses 36h.
    const clock = buildClockAt(Date.UTC(2026, 11, 24, 12), [
      new ConstantTimeDilation({ absolute: new Date(`2026-12-25T00:00:00Z`) }, { hours: 36 }, { hours: 72 }),
    ]);
    clock.relativeTimeInMillis; // prime before the window

    jest.setSystemTime(Date.UTC(2026, 11, 28, 12)); // idle straight past the 3-day window
    expect(clock.relativeTimeInMillis - clock.referenceTimeInMillis).toEqual(-36 * hour);
  });
});
