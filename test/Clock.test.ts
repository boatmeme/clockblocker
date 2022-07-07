import { Clock } from '../src/index';

describe(`Clock class`, () => {
  const currentDate = new Date();

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
  describe(`getRealTime`, () => {
    it('returns the real time', () => {
      const clock = new Clock();
      const start = clock.realTimeInMillis;
      expect(typeof start).toBe('number');
      expect(start).toEqual(currentDate.getTime());

      jest.advanceTimersByTime(1000);

      const end = clock.realTimeInMillis;
      expect(typeof end).toBe('number');
      expect(end - start).toEqual(1000);
    });
  });
});
