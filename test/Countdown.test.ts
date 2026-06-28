import { Countdown, ConstantTimeCompression, ConstantTimeDilation } from '../src/index';

describe(`Countdown`, () => {
  const minute = 60 * 1000;
  const start = Date.UTC(2026, 0, 1, 9, 0);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Build the countdown *after* setting the system time so its t=0 is `start`.
  const buildAt = (
    constructAtMs: number,
    target: ConstructorParameters<typeof Countdown>[0],
    distortions: ConstructorParameters<typeof Countdown>[1] = [],
  ) => {
    jest.setSystemTime(constructAtMs);
    return new Countdown(target, distortions);
  };

  it(`counts down in real time when undistorted`, () => {
    const countdown = buildAt(start, { minutes: 10 });
    expect(countdown.targetInMillis).toEqual(10 * minute);
    expect(countdown.clock.referenceTimeInMillis).toEqual(start);
    expect(countdown.remainingInMillis).toEqual(10 * minute);
    expect(countdown.isComplete).toBe(false);

    jest.setSystemTime(start + 4 * minute);
    expect(countdown.remainingInMillis).toEqual(6 * minute);

    jest.setSystemTime(start + 10 * minute);
    expect(countdown.remainingInMillis).toEqual(0);
    expect(countdown.isComplete).toBe(true);
  });

  it(`rests at zero (never negative) past the deadline`, () => {
    const countdown = buildAt(start, { minutes: 10 });

    jest.setSystemTime(start + 25 * minute); // well past the deadline
    expect(countdown.remainingInMillis).toEqual(0);
    expect(countdown.isComplete).toBe(true);
  });

  it(`crawls early and sprints late but still hits zero on the real deadline`, () => {
    // 45-minute deadline. Half speed for the first 30 real minutes (the countdown crawls),
    // then double speed for the next 15 (it sprints) -- the dilation debt is fully repaid.
    const countdown = buildAt(start, { minutes: 45 }, [
      new ConstantTimeDilation({ elapsed: { minutes: 0 } }, { minutes: 15 }, { minutes: 30 }),
      new ConstantTimeCompression({ elapsed: { minutes: 30 } }, { minutes: 30 }, { minutes: 15 }),
    ]);

    // 30 real minutes in, the clock has only ticked down 15 of the 45 -- it crawled.
    jest.setSystemTime(start + 30 * minute);
    expect(countdown.remainingInMillis).toEqual(30 * minute);
    expect(countdown.isComplete).toBe(false);

    // ...and at the real 45-minute deadline it lands exactly on zero, having sprinted the rest.
    jest.setSystemTime(start + 45 * minute);
    expect(countdown.remainingInMillis).toEqual(0);
    expect(countdown.isComplete).toBe(true);
  });
});
