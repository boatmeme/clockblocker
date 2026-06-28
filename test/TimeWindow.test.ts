import ClockTime from '../src/ClockTime';
import TimeWindow, { TimeWindowComparison } from '../src/TimeWindow';

describe(`TimeWindow class`, () => {
  const currentDate = new Date(0);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(currentDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe(`durationInMillis`, () => {
    it(`should calculate a duration within the same day`, () => {
      const a = new ClockTime({
        hour: 12,
        minute: 0,
        second: 0,
      });
      const b = new ClockTime({
        hour: 13,
        minute: 0,
        second: 0,
      });
      const window = new TimeWindow(a, b);
      const result = window.durationInMillis;
      expect(result).toEqual(60 * 60 * 1000);
    });
    it(`should calculate a duration spanning multiple days`, () => {
      const a = new ClockTime({
        hour: 12,
        minute: 0,
        second: 0,
      });
      const b = new ClockTime({
        hour: 0,
        minute: 0,
        second: 0,
      });
      const window = new TimeWindow(a, b);
      const result = window.durationInMillis;
      expect(result).toEqual(12 * 60 * 60 * 1000);
    });
  });

  // durationInMillis is real elapsed time between two wall-clock times, so across a DST
  // transition the real duration differs from the nominal wall-clock span. These lock in the
  // Temporal-backed, timezone-aware behavior so it can't be "simplified" into naive math.
  describe(`durationInMillis across DST transitions (America/New_York)`, () => {
    const hour = 60 * 60 * 1000;
    const window = (startHour: number, endHour: number) =>
      new TimeWindow(new ClockTime({ hour: startHour }), new ClockTime({ hour: endHour }), `America/New_York`);

    it(`loses an hour on the spring-forward day`, () => {
      jest.setSystemTime(Date.UTC(2025, 2, 9, 12)); // 2025-03-09: clocks jump 02:00 -> 03:00
      // Wall-clock span is 3 hours but only 2 real hours elapse.
      expect(window(1, 4).durationInMillis).toEqual(2 * hour);
    });

    it(`gains an hour on the fall-back day`, () => {
      jest.setSystemTime(Date.UTC(2025, 10, 2, 12)); // 2025-11-02: clocks fall 02:00 -> 01:00
      // Wall-clock span is 3 hours but 4 real hours elapse (the 1am hour happens twice).
      expect(window(0, 3).durationInMillis).toEqual(4 * hour);
    });

    it(`equals the wall-clock span on a day with no transition`, () => {
      jest.setSystemTime(Date.UTC(2025, 5, 1, 12)); // 2025-06-01: no DST change
      expect(window(1, 4).durationInMillis).toEqual(3 * hour);
    });
  });

  // The window is a half-open interval [start, end): the start instant is inside, the end
  // instant is outside. Clock relies on this for adjacent, non-overlapping windows to hand
  // off cleanly, so pin the exact boundary behavior.
  describe(`compareWithinWindow`, () => {
    const hour = 60 * 60 * 1000;
    const window = new TimeWindow(new ClockTime({ hour: 12 }), new ClockTime({ hour: 13 }));
    const windowStart = 12 * hour; // resolved against the epoch day (UTC) from beforeEach
    const windowEnd = 13 * hour;

    it(`treats the start of the window as inclusive`, () => {
      expect(window.compareWithinWindow(windowStart - 1)).toEqual(TimeWindowComparison.EARLIER);
      expect(window.compareWithinWindow(windowStart)).toEqual(TimeWindowComparison.WITHIN);
    });

    it(`treats the end of the window as exclusive`, () => {
      expect(window.compareWithinWindow(windowEnd - 1)).toEqual(TimeWindowComparison.WITHIN);
      expect(window.compareWithinWindow(windowEnd)).toEqual(TimeWindowComparison.LATER);
    });
  });

  // resolveAt takes the Clock's zone as an argument, falling back to the window's own
  // construction zone when none is supplied (standalone use).
  describe(`resolveAt timezone`, () => {
    const window = new TimeWindow(new ClockTime({ hour: 1 }), new ClockTime({ hour: 2 }), `America/New_York`);
    const anchor = Date.UTC(2026, 5, 1, 12); // 2026-06-01 noon UTC (EDT, UTC-4)

    it(`falls back to the construction zone when no zone is passed`, () => {
      // Next 1am EDT after the anchor is 2026-06-02 05:00Z.
      expect(window.resolveAt(anchor).startMs).toEqual(Date.UTC(2026, 5, 2, 5));
    });

    it(`uses the supplied zone, overriding the construction zone`, () => {
      // Next 1am UTC after the anchor is 2026-06-02 01:00Z.
      expect(window.resolveAt(anchor, `UTC`).startMs).toEqual(Date.UTC(2026, 5, 2, 1));
    });
  });
});
