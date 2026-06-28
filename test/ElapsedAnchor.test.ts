import { Clock, ConstantTimeCompression, ConstantTimeDilation } from '../src/index';

// An elapsed-anchored window is pinned to the run's own t=0 (the Clock's construction instant)
// and measured in real time, so it behaves the same no matter what the wall clock reads. These
// drive a Clock through such windows and assert the offset integrator handles them unchanged.
describe(`elapsed anchor`, () => {
  const minute = 60 * 1000;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Build the clock *after* setting the system time, so the run anchor is `constructAtMs`.
  const buildClockAt = (constructAtMs: number, distortions: ConstructorParameters<typeof Clock>[0]) => {
    jest.setSystemTime(constructAtMs);
    return new Clock(distortions);
  };

  describe(`is run-relative, not time-of-day`, () => {
    // Half speed for the first 30 real minutes of the run => loses 15 minutes by minute 30.
    const dilation = () => [new ConstantTimeDilation({ elapsed: { minutes: 0 } }, { minutes: 15 }, { minutes: 30 })];

    const lostByMinute30 = (constructAtMs: number) => {
      const clock = buildClockAt(constructAtMs, dilation());
      jest.setSystemTime(constructAtMs + 30 * minute);
      return clock.relativeTimeInMillis - clock.referenceTimeInMillis;
    };

    it(`distorts the first 30 minutes the same regardless of the calendar date`, () => {
      // Two runs started decades and time-zones apart; the elapsed window fires identically.
      expect(lostByMinute30(Date.UTC(2026, 0, 1, 14, 17))).toEqual(-15 * minute);
      expect(lostByMinute30(Date.UTC(1995, 5, 15, 3, 41))).toEqual(-15 * minute);
    });
  });

  describe(`polling-frequency independence`, () => {
    const dilation = () => [new ConstantTimeDilation({ elapsed: { minutes: 0 } }, { minutes: 15 }, { minutes: 30 })];
    const start = Date.UTC(2026, 0, 1);

    it(`reaches the same offset whether polled once or every minute`, () => {
      const coarse = buildClockAt(start, dilation());
      jest.setSystemTime(start + 30 * minute);
      const coarseOffset = coarse.offset;

      const fine = buildClockAt(start, dilation());
      let fineOffset = 0;
      for (let t = 0; t <= 30 * minute; t += minute) {
        jest.setSystemTime(start + t);
        fineOffset = fine.offset;
      }

      expect(fineOffset).toEqual(coarseOffset);
      expect(fineOffset).toEqual(-15 * minute);
    });
  });

  describe(`a dilation paid back by a later compression over disjoint elapsed windows`, () => {
    const start = Date.UTC(2026, 0, 1);
    // 0-30min: half speed (lose 15m). 30-45min: double speed (gain 15m). Nets to zero by 45m.
    const distortions = () => [
      new ConstantTimeDilation({ elapsed: { minutes: 0 } }, { minutes: 15 }, { minutes: 30 }),
      new ConstantTimeCompression({ elapsed: { minutes: 30 } }, { minutes: 30 }, { minutes: 15 }),
    ];

    it(`runs behind mid-run but returns to perfect sync by the end of the run`, () => {
      const clock = buildClockAt(start, distortions());

      jest.setSystemTime(start + 30 * minute); // dilation done, compression not yet started
      expect(clock.relativeTimeInMillis - clock.referenceTimeInMillis).toEqual(-15 * minute);

      jest.setSystemTime(start + 45 * minute); // compression has clawed it all back
      expect(clock.relativeTimeInMillis).toEqual(clock.referenceTimeInMillis);
    });
  });
});
