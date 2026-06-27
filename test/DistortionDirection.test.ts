import { ConstantTimeCompression, ConstantTimeDilation } from '../src/index';

// ConstantTimeDilation and ConstantTimeCompression apply the same formula; their names only
// express intent and are not enforced (README roadmap #2 contemplates validation that would).
// What actually determines whether the clock speeds up or slows down is the ratio of relative
// to reference duration -- not which class was instantiated.
describe(`distortion direction is set by the durations, not the class name`, () => {
  it(`the two classes are mathematically identical for identical parameters`, () => {
    const dilation = new ConstantTimeDilation({ hour: 1 }, { hours: 3 }, { hours: 6 });
    const compression = new ConstantTimeCompression({ hour: 1 }, { hours: 3 }, { hours: 6 });
    expect(dilation.distortTime(1000)).toEqual(compression.distortTime(1000));
  });

  it(`a "dilation" with relative > reference actually speeds the clock up`, () => {
    // Mislabeled: this is really a compression. 2x speed => +1000ms of fake time per 1000ms
    // of real time, i.e. a positive offset delta (the clock runs ahead).
    const mislabeled = new ConstantTimeDilation({ hour: 1 }, { hours: 6 }, { hours: 3 });
    expect(mislabeled.distortTime(1000)).toEqual(1000);
  });

  it(`a "compression" with relative < reference actually slows the clock down`, () => {
    // Mislabeled: this is really a dilation. Half speed => -500ms per 1000ms of real time,
    // i.e. a negative offset delta (the clock runs behind).
    const mislabeled = new ConstantTimeCompression({ hour: 1 }, { hours: 3 }, { hours: 6 });
    expect(mislabeled.distortTime(1000)).toEqual(-500);
  });
});
