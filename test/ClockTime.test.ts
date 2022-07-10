import { ClockTimeComparison } from '../src/ClockTime';
import { ClockTime } from '../src/index';

describe(`ClockTime class`, () => {
  const currentDate = new Date(0);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(currentDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe(`compare`, () => {
    it(`should compare two equivalent ClockTimes`, () => {
      const a = new ClockTime({
        hour: 12,
        minute: 0,
        second: 0,
      });
      const b = new ClockTime({
        hour: 12,
        minute: 0,
        second: 0,
      });
      const result = a.compare(b);
      expect(result).toEqual(ClockTimeComparison.EQUIVALENT);
    });
    it(`should compare an earlier and later ClockTime`, () => {
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
      const result = a.compare(b);
      expect(result).toEqual(ClockTimeComparison.EARLIER);
    });
    it(`should compare an earlier and later ClockTime`, () => {
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
      const result = b.compare(a);
      expect(result).toEqual(ClockTimeComparison.LATER);
    });
  });

  describe(`forTodayInMillis`, () => {
    describe(`no params`, () => {
      it(`returns today's occurrence, in UTC, of the wall-clock time, in epoch millis'`, () => {
        const hour = 12;
        const clockTime = new ClockTime({
          hour,
          minute: 0,
          second: 0,
        });
        const expectedTime = hour * 1000 * 60 * 60;
        const todayInMillis = clockTime.forTodayInMillis();
        expect(todayInMillis).toEqual(expectedTime);
      });
    });
    describe(`with Time Zone`, () => {
      it(`returns today's occurrence, Time-zone adjusted, of the wall-clock time, in epoch millis'`, () => {
        const hour = 12;
        const clockTime = new ClockTime({
          hour,
          minute: 0,
          second: 0,
        });
        const expectedTime = -((hour - 7) * 1000 * 60 * 60);
        const todayInMillis = clockTime.forTodayInMillis(`America/Denver`);
        expect(todayInMillis).toEqual(expectedTime);
      });
    });
  });
});
