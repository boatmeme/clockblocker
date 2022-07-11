import RelativeTimeDistortion from './RelativeTimeDistortion';
export default class TimeCompression extends RelativeTimeDistortion {
  get warpFactor() {
    return this.referenceDurationInMillis / this.timeWindow.durationInMillis;
  }
}
