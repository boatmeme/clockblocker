import { Clock, ClockTime, ConstantTimeCompression, ConstantTimeDilation } from '../src/index';
import TimeWindow from '../src/TimeWindow';

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
  describe(`getRelativeTime`, () => {
    it('returns the relative time', () => {
      /*
        0000 - 2000 - normal time
        2000 - 3000 - half-time
        3000 - 4000 - double-time
        4000 - onward - normal time
        */
      const clock = new Clock([
        new ConstantTimeDilation(new TimeWindow(new ClockTime({ second: 2 }), new ClockTime({ second: 3 })), {
          seconds: 2,
        }),
        new ConstantTimeCompression(new TimeWindow(new ClockTime({ second: 3 }), new ClockTime({ second: 4 })), {
          milliseconds: 500,
        }),
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

      expect(clock.relativeTimeInMillis).toEqual(3250);
      expect(clock.referenceTimeInMillis).toEqual(3500);

      jest.advanceTimersByTime(500);

      expect(clock.relativeTimeInMillis).toEqual(4000);
      expect(clock.referenceTimeInMillis).toEqual(4000);

      jest.advanceTimersByTime(2750);

      expect(clock.relativeTimeInMillis).toEqual(6750);
      expect(clock.referenceTimeInMillis).toEqual(6750);
    });
  });
});
