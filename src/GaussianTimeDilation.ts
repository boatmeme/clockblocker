import AbstractGaussianTimeDistortion from './AbstractGaussianTimeDistortion';
export default class GaussianTimeDilation extends AbstractGaussianTimeDistortion {
  distortTime(numberOfMilliseconds: number, offset: number): number {
    const duration = this.timeWindow.durationInMillis;
    const scale = this.timeWindow.durationInMillis / this.referenceDurationInMillis;
    const elapsedTime = [...Array(numberOfMilliseconds).keys()].reduce((acc, v) => {
      const val = 10 * ((v + offset) / duration) - 5;
      //console.log(val, this._distribution.cdf(val));
      return acc + this._distribution.cdf(val) * scale;
    }, 0);
    return -elapsedTime;
  }
}
