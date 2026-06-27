import { Clock, ConstantTimeDilation } from '../src/index';

// End-to-end scenarios that read as executable documentation of what the library is for.
describe(`scenarios`, () => {
  const hour = 60 * 60 * 1000;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(0)); // midnight UTC on the epoch day
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe(`Christmas morning (the README story)`, () => {
    it(`keeps the clock below 4:00am until it is really 7:00am`, () => {
      const fourAm = 4 * hour;
      // Slow time starting at 1am so the fake clock only crawls from 1am to 4am over the 6
      // real hours leading up to 7am -- the small human won't see 4:00am until then.
      const clock = new Clock([new ConstantTimeDilation({ hour: 1 }, { hours: 3 }, { hours: 6 })]);

      jest.setSystemTime((6 * 60 + 59) * 60 * 1000); // 6:59am real
      // Still reads 3:59am-ish, so the early riser rolls over and goes back to sleep.
      expect(clock.relativeTimeInMillis).toBeLessThan(fourAm);

      jest.setSystemTime(7 * hour); // 7:00am real
      expect(clock.relativeTimeInMillis).toEqual(fourAm); // now, and only now, it reads 4:00am
    });
  });

  describe(`a dilation with no compensating compression`, () => {
    it(`leaves the clock permanently behind by the time it lost`, () => {
      // Half speed for 2 hours from 1am: the clock loses exactly 1 hour and never regains it.
      const clock = new Clock([new ConstantTimeDilation({ hour: 1 }, { hours: 1 }, { hours: 2 })]);

      jest.setSystemTime(3 * hour); // window just ended
      expect(clock.relativeTimeInMillis).toEqual(clock.referenceTimeInMillis - hour);

      jest.setSystemTime(12 * hour); // much later -- still exactly 1 hour behind, no recovery
      expect(clock.relativeTimeInMillis).toEqual(clock.referenceTimeInMillis - hour);
    });
  });
});
