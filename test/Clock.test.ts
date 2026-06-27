import { Clock, ConstantTimeCompression, ConstantTimeDilation } from '../src/index';

describe(`Clock class`, () => {
  const currentDate = new Date(0);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(currentDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe(`constructor`, () => {
    it('exists', () => {
      const clock = new Clock();
      expect(clock).toBeInstanceOf(Clock);
    });
  });
  describe(`getReferenceTime`, () => {
    it('returns the reference, local-clock time', () => {
      const clock = new Clock();
      const start = clock.referenceTimeInMillis;
      expect(typeof start).toBe('number');
      expect(start).toEqual(currentDate.getTime());

      jest.advanceTimersByTime(1000);

      const end = clock.referenceTimeInMillis;
      expect(typeof end).toBe('number');
      expect(end - start).toEqual(1000);
    });
  });
  describe(`offset`, () => {
    it('is idempotent when read repeatedly without time advancing', () => {
      const hour = 1000 * 60 * 60;
      const clock = new Clock([new ConstantTimeDilation({ hour: 1 }, { hours: 3 }, { hours: 6 })]);

      jest.setSystemTime(4 * hour); // partway through the dilation window

      // Each read consumes the elapsed slice, so subsequent reads at the same instant must
      // not keep accumulating the same interval.
      const first = clock.offset;
      expect(clock.offset).toEqual(first);
      expect(clock.offset).toEqual(first);
      expect(first).toEqual(-1.5 * hour);
    });

    it('does not double-count when read via offset and then relativeTimeInMillis', () => {
      const hour = 1000 * 60 * 60;
      const clock = new Clock([new ConstantTimeDilation({ hour: 1 }, { hours: 3 }, { hours: 6 })]);

      jest.setSystemTime(4 * hour);

      const offset = clock.offset;
      expect(clock.relativeTimeInMillis).toEqual(clock.referenceTimeInMillis + offset);
    });
  });
  describe(`getRelativeTime`, () => {
    it('documentation example (matches the hour-by-hour table in the README)', () => {
      // System time starts at the epoch (1970-01-01T00:00:00Z), i.e. midnight UTC, so the
      // hourly checkpoints below line up with the wall-clock windows of the distortions.
      const clock = new Clock([
        new ConstantTimeDilation(
          { hour: 1 }, // start at 1am (system)
          { hours: 3 }, // Relative duration: 3 hours of fake time appear to pass...
          { hours: 6 }, // Reference duration: ...over 6 real hours (clock runs at half speed)
        ),
        new ConstantTimeCompression(
          { hour: 7 }, // start at 7am
          { hours: 6 }, // Relative duration: 6 hours of fake time appear to pass...
          { hours: 3 }, // Reference duration: ...over 3 real hours (clock runs at double speed)
        ),
      ]);

      const hour = 1000 * 60 * 60;
      // [real hours since midnight, expected fake hours] — copied straight from the README.
      const table: Array<[number, number]> = [
        [1, 1], // before any distortion: 1-to-1
        [2, 1.5], // dilation @ half speed
        [3, 2],
        [4, 2.5],
        [5, 3],
        [6, 3.5],
        [7, 4], // dilation window done: fake clock is 3 hours behind
        [8, 6], // compression @ double speed begins catching up
        [9, 8],
        [10, 10], // **back in sync**
        [11, 11], // 1-to-1 again
      ];

      // The clock must be polled as time advances so it can accumulate the offset; reading
      // `relativeTimeInMillis` each hour does exactly that.
      for (const [realHour, fakeHour] of table) {
        jest.setSystemTime(realHour * hour);
        expect(clock.relativeTimeInMillis).toEqual(fakeHour * hour);
        expect(clock.referenceTimeInMillis).toEqual(realHour * hour);
      }
    });
    it('returns the relative time', () => {
      /*
        0000 - 2000 - normal time
        2000 - 3000 - half-time
        3000 - 4000 - double-time
        4000 - onward - normal time
        */
      const clock = new Clock([
        new ConstantTimeDilation(
          { second: 2 },
          { milliseconds: 500 },
          {
            seconds: 1,
          },
        ),
        new ConstantTimeCompression(
          { second: 3 },
          {
            seconds: 2,
          },
          { seconds: 1 },
        ),
      ]);
      const relativeNow = clock.relativeTimeInMillis;
      expect(typeof relativeNow).toBe('number');
      expect(relativeNow).toEqual(currentDate.getTime());

      jest.advanceTimersByTime(2000);

      expect(clock.relativeTimeInMillis).toEqual(2000);
      expect(clock.referenceTimeInMillis).toEqual(2000);

      jest.advanceTimersByTime(500);

      expect(clock.relativeTimeInMillis).toEqual(2250);
      expect(clock.referenceTimeInMillis).toEqual(2500);

      jest.advanceTimersByTime(100);

      expect(clock.relativeTimeInMillis).toEqual(2300);
      expect(clock.referenceTimeInMillis).toEqual(2600);

      jest.advanceTimersByTime(100);

      expect(clock.relativeTimeInMillis).toEqual(2350);
      expect(clock.referenceTimeInMillis).toEqual(2700);

      jest.advanceTimersByTime(200);

      expect(clock.relativeTimeInMillis).toEqual(2450);
      expect(clock.referenceTimeInMillis).toEqual(2900);

      jest.advanceTimersByTime(100);

      expect(clock.relativeTimeInMillis).toEqual(2500);
      expect(clock.referenceTimeInMillis).toEqual(3000);

      jest.advanceTimersByTime(500);

      // compression window (double-time): 500ms real => 1000ms fake
      expect(clock.relativeTimeInMillis).toEqual(3500);
      expect(clock.referenceTimeInMillis).toEqual(3500);

      jest.advanceTimersByTime(500);

      // end of compression window: dilation removed 500ms of fake time, compression added
      // 1000ms, so the fake clock ends up 500ms ahead of real time
      expect(clock.relativeTimeInMillis).toEqual(4500);
      expect(clock.referenceTimeInMillis).toEqual(4000);

      jest.advanceTimersByTime(2750);

      // back to 1-to-1: the 500ms lead is carried forward unchanged
      expect(clock.relativeTimeInMillis).toEqual(7250);
      expect(clock.referenceTimeInMillis).toEqual(6750);
    });
  });
});
