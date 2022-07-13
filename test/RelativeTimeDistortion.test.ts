import { ConstantTimeDilation, ClockTime, TimeWindow } from '../src/index';
import RelativeTimeDistortion from '../src/RelativeTimeDistortion';

describe(`RelativeTimeDistortion class`, () => {
  const start = new ClockTime({
    hour: 0,
    minute: 0,
    second: 1,
  });
  const end = new ClockTime({
    hour: 0,
    minute: 0,
    second: 2,
  });
  const timeWindow = new TimeWindow(start, end);

  const distortTimeMock = jest.fn();

  class ConcreteRelativeTimeDistortion extends RelativeTimeDistortion {
    protected distortTime = distortTimeMock;
  }

  describe(`getElapsedTimeInMillis`, () => {
    describe('defaults', () => {
      it(`sets offset = 0 and length = window duration`, () => {
        const timewarp = new ConcreteRelativeTimeDistortion(timeWindow, { seconds: 2 });
        timewarp.getElapsedTimeInMillis();
        expect(distortTimeMock).toHaveBeenCalledWith(1000, 0);
      });
    });
    describe('params', () => {
      it('calls `distortTime` with length and offset', () => {
        const timewarp = new ConcreteRelativeTimeDistortion(timeWindow, { seconds: 2 });
        timewarp.getElapsedTimeInMillis(500, 2000);
        expect(distortTimeMock).toHaveBeenCalledWith(2000, 500);
      });
    });
  });
});
