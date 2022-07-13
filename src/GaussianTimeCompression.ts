import AbstractGaussianTimeDistortion from './AbstractGaussianTimeDistortion';
export default class GaussianTimeCompression extends AbstractGaussianTimeDistortion {
  distortTime(numberOfMilliseconds: number, offset: number): number {
    const duration = this.timeWindow.durationInMillis;
    const scale = this.referenceDurationInMillis / this.timeWindow.durationInMillis;
    const elapsedTime = [...Array(numberOfMilliseconds).keys()].reduce(
      (acc, v) => acc + this._distribution.cdf(10 * ((v + offset) / duration) - 5),
      0,
    );
    return elapsedTime / scale;
  }
}
