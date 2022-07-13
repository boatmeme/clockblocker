import gaussian, { Gaussian } from 'gaussian';
import RelativeTimeDistortion, { Duration } from './RelativeTimeDistortion';
import TimeWindow from './TimeWindow';
export default abstract class AbstractGaussianTimeDilation extends RelativeTimeDistortion {
  protected _distribution: Gaussian;
  constructor(timeWindow: TimeWindow, referenceDuration: Duration | undefined, variance: number) {
    super(timeWindow, referenceDuration);
    //const duration = this.timeWindow.durationInMillis;
    //const mean = [...Array(duration).keys()].reduce((acc, v) => acc + v, 0) / duration;
    this._distribution = gaussian(0, variance);
  }
}
