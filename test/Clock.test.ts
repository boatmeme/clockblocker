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
  describe(`getRelativeTime`, () => {
    it('documentation example', () => {
      const clock = new Clock([
        new ConstantTimeDilation(
          { hour: 1 }, // start at 1am (system),
          {
            hours: 3, // Relative duration: 3 hours will appear to pass
          },
          {
            hours: 6, // Reference duration: It will take 6 hours, real-time for the 3 hour `dilationWindow` to appear to pass
          },
        ),
        new ConstantTimeCompression(
          { hour: 7 }, // start at 7 am,
          { hours: 3 }, // Relative time: It will appear that 3 hours have passed
          {
            minutes: 90, // Reference time: but, in reality, only 90 minutes have passed
          },
        ),
      ]);

      const hour = 1000 * 60 * 60;
      jest.advanceTimersByTime(hour);
      expect(clock.relativeTimeInMillis).toEqual(hour);
      expect(clock.referenceTimeInMillis).toEqual(hour);

      jest.advanceTimersByTime(hour);

      expect(clock.relativeTimeInMillis).toEqual(hour * 1.5);
      expect(clock.referenceTimeInMillis).toEqual(hour * 2);

      jest.advanceTimersByTime(hour);

      expect(clock.relativeTimeInMillis).toEqual(hour * 2);
      expect(clock.referenceTimeInMillis).toEqual(hour * 3);

      jest.advanceTimersByTime(hour);

      expect(clock.relativeTimeInMillis).toEqual(hour * 2.5);
      expect(clock.referenceTimeInMillis).toEqual(hour * 4);

      jest.advanceTimersByTime(hour);

      expect(clock.relativeTimeInMillis).toEqual(hour * 3);
      expect(clock.referenceTimeInMillis).toEqual(hour * 5);
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
