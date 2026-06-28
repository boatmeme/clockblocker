import { Stopwatch, ConstantTimeDilation } from '../src/index';

describe(`Stopwatch`, () => {
  const minute = 60 * 1000;
  const start = Date.UTC(2026, 0, 1, 9, 0);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Build the stopwatch *after* setting the system time so its t=0 is `start`.
  const buildAt = (constructAtMs: number, distortions: ConstructorParameters<typeof Stopwatch>[0] = []) => {
    jest.setSystemTime(constructAtMs);
    return new Stopwatch(distortions);
  };

  it(`counts up in real time when undistorted`, () => {
    const stopwatch = buildAt(start);
    expect(stopwatch.elapsedInMillis).toEqual(0);

    jest.setSystemTime(start + 10 * minute);
    expect(stopwatch.elapsedInMillis).toEqual(10 * minute);
    expect(stopwatch.referenceElapsedInMillis).toEqual(10 * minute);
    // The underlying Clock is reachable for absolute warped/real readings.
    expect(stopwatch.clock.relativeTimeInMillis).toEqual(start + 10 * minute);
  });

  it(`crawls while an elapsed dilation window is active`, () => {
    // Half speed for the first 30 real minutes of the run.
    const stopwatch = buildAt(start, [
      new ConstantTimeDilation({ elapsed: { minutes: 0 } }, { minutes: 15 }, { minutes: 30 }),
    ]);

    jest.setSystemTime(start + 30 * minute);
    // 30 real minutes have passed, but the stopwatch only shows 15 warped minutes...
    expect(stopwatch.elapsedInMillis).toEqual(15 * minute);
    // ...while real elapsed time is unbent.
    expect(stopwatch.referenceElapsedInMillis).toEqual(30 * minute);
  });
});
