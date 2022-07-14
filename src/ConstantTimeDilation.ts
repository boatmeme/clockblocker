import RelativeTimeDistortion from './RelativeTimeDistortion';
export default class TimeDilation extends RelativeTimeDistortion {
  distortTime(numberOfMilliseconds: number): number {
    return -numberOfMilliseconds * (this.relativeDurationInMillis / this.referenceDurationInMillis);
  }
}
