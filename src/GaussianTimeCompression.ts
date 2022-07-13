import AbstractGaussianTimeDistortion from './AbstractGaussianTimeDistortion';
export default class GaussianTimeCompression extends AbstractGaussianTimeDistortion {
  distortTime(numberOfMilliseconds: number, offset: number): number {
    const duration = this.timeWindow.durationInMillis;
    const scale = this.referenceDurationInMillis / duration;
    const maxVal = 10 * ((numberOfMilliseconds + offset) / duration) - 5;
    const offsetVal = 10 * (offset / duration) - 5;
    const maxTime = this._distribution.cdf(maxVal);
    const minTime = this._distribution.cdf(offsetVal);
    return (maxTime - minTime) * scale * 1000;
  }
}
