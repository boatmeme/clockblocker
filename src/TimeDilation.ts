import RelativeTimeDistortion from './RelativeTimeDistortion';
export default class TimeDilation extends RelativeTimeDistortion {
  get warpFactor() {
    return this.timeWindow.durationInMillis / this.referenceDurationInMillis;
  }

  get referenceEndInMillis() {
    return this.timeWindow.windowStartInMillis + this.referenceDurationInMillis;
  }

  get relativeTimeInMillis() {
    const now = Date.now();
    if (now <= this.timeWindow.windowStartInMillis || now >= this.referenceEndInMillis) return now;
    return (now - this.timeWindow.windowStartInMillis) * this.warpFactor + this.timeWindow.windowStartInMillis;
  }
}
