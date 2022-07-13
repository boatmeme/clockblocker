import { GaussianTimeDilation, ClockTime, Clock, GaussianTimeCompression } from '../src/index';
import gaussian, { Gaussian } from 'gaussian';
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
      const start = new ClockTime({
        hour: 0,
        minute: 0,
        second: (Date.now() + 1000) / 1000,
      });
      const end = new ClockTime({
        hour: 0,
        minute: 0,
        second: (start.forTodayInMillis() + 1000) / 1000,
      });
      const timewarp = new GaussianTimeDilation(new TimeWindow(start, end), undefined, 1);
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
          new TimeWindow(new ClockTime({ second: 2 }), new ClockTime({ second: 3 })),
          {
            seconds: 2,
          },
          5.0,
        ),
        new GaussianTimeCompression(
          new TimeWindow(new ClockTime({ second: 3 }), new ClockTime({ second: 4 })),
          {
            milliseconds: 500,
          },
          5.0,
        ),
      ]);
      jest.advanceTimersByTime(2000);
      let time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(500);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(500);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(500);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(500);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(500);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
      jest.advanceTimersByTime(500);
      time = clock.relativeTimeInMillis;
      console.log(clock.referenceTimeInMillis, time);
    });
  });
});
