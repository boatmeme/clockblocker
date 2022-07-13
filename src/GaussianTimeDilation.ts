import AbstractGaussianTimeDistortion from './AbstractGaussianTimeDistortion';
export default class GaussianTimeDilation extends AbstractGaussianTimeDistortion {
  distortTime(numberOfMilliseconds: number, offset: number): number {
    const duration = this.timeWindow.durationInMillis;
    const scale = duration / this.referenceDurationInMillis;
    const maxVal = 10 * ((numberOfMilliseconds + offset) / duration) - 5;
    const offsetVal = 10 * (offset / duration) - 5;
    const maxTime = this._distribution.cdf(maxVal);
    const minTime = this._distribution.cdf(offsetVal);
    return -((maxTime - minTime) * scale) * 1000;
  }
}
