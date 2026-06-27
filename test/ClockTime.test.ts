import ClockTime, { ClockTimeComparison } from '../src/ClockTime';

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

  describe(`add`, () => {
    it(`advances the wall-clock time by the duration`, () => {
      const result = new ClockTime({ hour: 12 }).add({ hours: 1, minutes: 30 });
      expect(result.compare(new ClockTime({ hour: 13, minute: 30 }))).toEqual(ClockTimeComparison.EQUIVALENT);
    });

    it(`wraps past midnight, since a wall-clock time carries no date`, () => {
      const result = new ClockTime({ hour: 23 }).add({ hours: 2 });
      expect(result.compare(new ClockTime({ hour: 1 }))).toEqual(ClockTimeComparison.EQUIVALENT);
      expect(result.forTodayInMillis()).toEqual(60 * 60 * 1000); // 01:00, not 25:00
    });

    it(`preserves millisecond precision`, () => {
      const result = new ClockTime({ hour: 0, millisecond: 250 }).add({ milliseconds: 1500 });
      expect(result.forTodayInMillis()).toEqual(1750); // 250ms + 1500ms past midnight
    });
  });

  describe(`forTodayInMillis`, () => {
    describe(`sub-second precision`, () => {
      it(`resolves seconds and milliseconds`, () => {
        const clockTime = new ClockTime({ second: 1, millisecond: 500 });
        expect(clockTime.forTodayInMillis()).toEqual(1500);
      });
    });
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
  describe(`forTomorrowInMillis`, () => {
    describe(`no params`, () => {
      it(`returns tomorrow's occurrence, in UTC, of the wall-clock time, in epoch millis'`, () => {
        const hour = 12;
        const clockTime = new ClockTime({
          hour,
          minute: 0,
          second: 0,
        });
        const expectedTime = hour * 1000 * 60 * 60 + 24 * 1000 * 60 * 60;
        const todayInMillis = clockTime.forTomorrowInMillis();
        expect(todayInMillis).toEqual(expectedTime);
      });
    });
    describe(`with Time Zone`, () => {
      it(`returns tomorrow's occurrence, Time-zone adjusted, of the wall-clock time, in epoch millis'`, () => {
        const hour = 12;
        const clockTime = new ClockTime({
          hour,
          minute: 0,
          second: 0,
        });
        const expectedTime = -((hour - 7) * 1000 * 60 * 60) + 24 * 1000 * 60 * 60;
        const todayInMillis = clockTime.forTomorrowInMillis(`America/Denver`);
        expect(todayInMillis).toEqual(expectedTime);
      });
    });
  });
});
