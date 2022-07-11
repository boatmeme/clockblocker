import RelativeTimeDistortion from './RelativeTimeDistortion';
export default class TimeCompression extends RelativeTimeDistortion {
  distortTime(numberOfMilliseconds: number): number {
    return numberOfMilliseconds * (this.referenceDurationInMillis / this.timeWindow.durationInMillis);
  }
}
