import gaussian, { Gaussian } from 'gaussian';
import { ClockTimeDescriptor } from './ClockTime';
import RelativeTimeDistortion, { Duration } from './RelativeTimeDistortion';
export default abstract class AbstractGaussianTimeDilation extends RelativeTimeDistortion {
  protected _distribution: Gaussian;
  constructor(
    referenceStartClockTime: ClockTimeDescriptor,
    relativeDuration: Duration,
    referenceDuration: Duration | undefined,
    variance: number,
  ) {
    super(referenceStartClockTime, relativeDuration, referenceDuration);
    //const duration = this.timeWindow.durationInMillis;
    //const mean = [...Array(duration).keys()].reduce((acc, v) => acc + v, 0) / duration;
    this._distribution = gaussian(0, variance);
  }
}
