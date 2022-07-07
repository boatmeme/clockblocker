import { Clock } from '../src/index';

describe(`Clock class`, () => {
  describe(`constructor`, () => {
    it('exists', () => {
      const clock = new Clock();
      expect(clock).toBeInstanceOf(Clock);
    });
  });
  describe(`getRealTime`, () => {
    it('returns the real time', () => {
      const clock = new Clock();
      const now = clock.realTimeInMillis;
      expect(typeof now).toBe('number');
    });
  });
});
