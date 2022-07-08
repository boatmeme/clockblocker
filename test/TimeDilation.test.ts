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
    describe(`outside dilation window`, () => {
      it('returns the real time, before window begins', () => {
        const start = new Date(Date.now() + 1000);
        const end = new Date(start.getTime() + 1000);
        const timewarp = new TimeDilation(start, end);

        jest.advanceTimersByTime(500);

        const fraudTime = timewarp.relativeTimeInMillis;
        expect(typeof fraudTime).toBe('number');
        expect(fraudTime).toEqual(Date.now());
      });
      it('returns the real time, after window begin + realDurationInMillis', () => {
        const start = new Date(Date.now() + 1000);
        const end = new Date(start.getTime() + 1000);
        const timewarp = new TimeDilation(start, end, 2000);

        jest.advanceTimersByTime(500);

        let fraudTime = timewarp.relativeTimeInMillis;
        expect(typeof fraudTime).toBe('number');
        expect(fraudTime).toEqual(Date.now());

        jest.advanceTimersByTime(501);

        fraudTime = timewarp.relativeTimeInMillis;
        expect(typeof fraudTime).toBe('number');
        expect(fraudTime).toBeLessThan(Date.now());

        jest.advanceTimersByTime(2000);

        fraudTime = timewarp.relativeTimeInMillis;
        expect(typeof fraudTime).toBe('number');
        expect(fraudTime).toEqual(Date.now());
      });
    });
    describe(`inside dilation window`, () => {
      it('returns a dilated time, with realTimeInMillis default', () => {
        const start = new Date(Date.now() + 1000);
        const end = new Date(start.getTime() + 1000);
        const timewarp = new TimeDilation(start, end);

        jest.advanceTimersByTime(1500);

        const fraudTime = timewarp.relativeTimeInMillis;
        expect(typeof fraudTime).toBe('number');
        expect(fraudTime).toEqual(Date.now());
      });
      it('returns a dilated time', () => {
        const start = new Date(Date.now() + 1000);
        const end = new Date(start.getTime() + 1000);
        const timewarp = new TimeDilation(start, end, 2000);

        jest.advanceTimersByTime(1500);

        const fraudTime = timewarp.relativeTimeInMillis;
        expect(typeof fraudTime).toBe('number');
        expect(fraudTime).toBeLessThan(Date.now());
        expect(fraudTime).toEqual(1250);
      });
    });
  });
});
