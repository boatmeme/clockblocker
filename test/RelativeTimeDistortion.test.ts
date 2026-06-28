import RelativeTimeDistortion from '../src/RelativeTimeDistortion';
import TimeWindow from '../src/TimeWindow';
import ElapsedWindow from '../src/ElapsedWindow';
import AbsoluteWindow from '../src/AbsoluteWindow';

describe(`RelativeTimeDistortion class`, () => {
  const start = {
    hour: 0,
    minute: 0,
    second: 1,
  };
  const end = {
    seconds: 2,
  };

  const distortTimeMock = jest.fn();

  class ConcreteRelativeTimeDistortion extends RelativeTimeDistortion {
    protected distortTime = distortTimeMock;
  }

  describe(`getElapsedTimeInMillis`, () => {
    describe('defaults', () => {
      it(`sets offset = 0 and length = window duration`, () => {
        const timewarp = new ConcreteRelativeTimeDistortion(start, { seconds: 1 });
        timewarp.getElapsedTimeInMillis();
        expect(distortTimeMock).toHaveBeenCalledWith(1000, 0);
      });
    });
    describe('params', () => {
      it('calls `distortTime` with length and offset', () => {
        const timewarp = new ConcreteRelativeTimeDistortion(start, { seconds: 2 }, end);
        timewarp.getElapsedTimeInMillis(500, 2000);
        expect(distortTimeMock).toHaveBeenCalledWith(2000, 500);
      });
    });
  });

  describe(`anchor`, () => {
    const minute = 60 * 1000;

    it(`builds a time-of-day window from a bare clock-time descriptor (the default)`, () => {
      const timewarp = new ConcreteRelativeTimeDistortion({ hour: 1 }, { hours: 1 });
      expect(timewarp.getTimeWindow()).toBeInstanceOf(TimeWindow);
    });

    it(`builds an elapsed window from an { elapsed } anchor`, () => {
      const timewarp = new ConcreteRelativeTimeDistortion(
        { elapsed: { minutes: 5 } },
        { minutes: 10 },
        { minutes: 20 },
      );
      const window = timewarp.getTimeWindow();

      expect(window).toBeInstanceOf(ElapsedWindow);
      // Spans [elapsed, elapsed + referenceDuration) = [5min, 25min) relative to the run anchor.
      expect(window.resolveAt(0)).toEqual({ startMs: 5 * minute, endMs: 25 * minute });
    });

    it(`builds an absolute window from an { absolute } anchor`, () => {
      const timewarp = new ConcreteRelativeTimeDistortion(
        { absolute: new Date(`2026-12-25T01:00:00Z`) },
        { hours: 3 },
        { hours: 6 },
      );
      const window = timewarp.getTimeWindow();

      expect(window).toBeInstanceOf(AbsoluteWindow);
      // Spans [start, start + referenceDuration) = [01:00Z, 07:00Z), independent of the anchor.
      expect(window.resolveAt(0)).toEqual({ startMs: Date.UTC(2026, 11, 25, 1), endMs: Date.UTC(2026, 11, 25, 7) });
    });
  });
});
