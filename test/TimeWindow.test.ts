import ClockTime from '../src/ClockTime';
import TimeWindow from '../src/TimeWindow';

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
});
