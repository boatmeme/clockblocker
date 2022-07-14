import { GaussianTimeDilation, Clock, GaussianTimeCompression } from '../src/index';
import gaussian from 'gaussian';
import TimeWindow from '../src/TimeWindow';

describe(`GaussianTimeDilation class`, () => {
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
      const start = {
        hour: 0,
        minute: 0,
        second: 1,
      };
      const end = {
        seconds: 2,
      };
      const timewarp = new GaussianTimeDilation(start, end, end, 1);
      expect(timewarp).toBeInstanceOf(GaussianTimeDilation);
    });
  });

  describe(`getElapsedTimeInMillis`, () => {
    it('returns elapsed millis according to a gaussian distribution (variance = 1)', () => {
      const g = gaussian(0, 5);
      console.log(g.cdf(2));
    });
  });

  describe(`getElapsedTimeInMillis`, () => {
    it('returns elapsed millis according to a gaussian distribution (variance = 1)', () => {
      const clock = new Clock([
        new GaussianTimeDilation(
          { second: 2 },
          {
            seconds: 2,
          },
          { seconds: 1 },
          5.0,
        ),
        new GaussianTimeCompression(
          { second: 3 },
          {
            milliseconds: 500,
          },
          { seconds: 1 },
          5.0,
        ),
      ]);
      jest.advanceTimersByTime(2000);
      let time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(100);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
    });
  });
});
