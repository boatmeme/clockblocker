import RelativeTimeDistortion from './RelativeTimeDistortion';
export default class TimeDilation extends RelativeTimeDistortion {
  get warpFactor() {
    return -this.timeWindow.durationInMillis / this.referenceDurationInMillis;
  }
}
