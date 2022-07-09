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
