import { TimeDilation } from '../src/index';

describe(`TimeDilation class`, () => {
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
      const start = new Date(Date.now() + 1000);
      const end = new Date(start.getTime() + 1000);
      const timewarp = new TimeDilation(start, end);
      expect(timewarp).toBeInstanceOf(TimeDilation);
    });
  });

  describe(`getRelativeTimeInMillis`, () => {
    it('returns the real time, if outside a dilation window', () => {
      const start = new Date(Date.now() + 1000);
      const end = new Date(start.getTime() + 1000);
      const timewarp = new TimeDilation(start, end);

      jest.advanceTimersByTime(500);

      const fraudTime = timewarp.relativeTimeInMillis;
      expect(typeof fraudTime).toBe('number');
      expect(fraudTime).toEqual(Date.now());
    });
    it('returns a dilated time, if within a dilation window', () => {
      const start = new Date(Date.now() + 1000);
      const end = new Date(start.getTime() + 1000);
      const timewarp = new TimeDilation(start, end);

      jest.advanceTimersByTime(1500);

      const fraudTime = timewarp.relativeTimeInMillis;
      expect(typeof fraudTime).toBe('number');
      expect(fraudTime).toBeLessThan(Date.now());
    });
  });
});
