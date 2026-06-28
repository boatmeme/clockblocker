import { Clock, ConstantTimeDilation } from '../src/index';

// A time-of-day window resolves against the Clock's configured zone. Before this option existed,
// every time-of-day window was silently UTC -- wrong for a clock that lives anywhere else.
describe(`Clock timezone`, () => {
  const hour = 60 * 60 * 1000;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // 1am-7am at half speed (loses 3h over the window).
  const dilation = () => [new ConstantTimeDilation({ hour: 1 }, { hours: 3 }, { hours: 6 })];

  it(`defaults to UTC`, () => {
    jest.setSystemTime(Date.UTC(2026, 11, 25, 0));
    expect(new Clock().timeZone).toEqual(`UTC`);
  });

  it(`places the same wall-clock window at different instants per zone`, () => {
    jest.setSystemTime(Date.UTC(2026, 11, 25, 0)); // 00:00Z, before both windows
    const utc = new Clock(dilation());
    const denver = new Clock(dilation(), { timeZone: `America/Denver` });

    expect(denver.timeZone).toEqual(`America/Denver`);

    // 07:00Z: the UTC window (01:00-07:00Z) has fully run -- 3h behind. Denver's "1am" is
    // 08:00Z (MST, UTC-7), so its window hasn't started: still perfectly in sync.
    jest.setSystemTime(Date.UTC(2026, 11, 25, 7));
    expect(utc.relativeTimeInMillis - utc.referenceTimeInMillis).toEqual(-3 * hour);
    expect(denver.relativeTimeInMillis - denver.referenceTimeInMillis).toEqual(0);

    // 14:00Z: Denver's window (08:00-14:00Z) has now fully run too -- 3h behind, just shifted.
    jest.setSystemTime(Date.UTC(2026, 11, 25, 14));
    expect(denver.relativeTimeInMillis - denver.referenceTimeInMillis).toEqual(-3 * hour);
  });
});
