import RelativeTimeDistortion from '../src/RelativeTimeDistortion';

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
});
