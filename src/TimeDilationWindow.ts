import RelativeTimeWindow from './RelativeTimeWindow';
export default class TimeDilationWindow extends RelativeTimeWindow {
  get warpFactor() {
    return (this.windowEndInMillis - this.windowStartInMillis) / this.referenceDurationInMillis;
  }

  get referenceEndInMillis() {
    return this.windowStartInMillis + this.referenceDurationInMillis;
  }

  get relativeTimeInMillis() {
    const now = Date.now();
    if (now <= this.windowStartInMillis || now >= this.referenceEndInMillis) return now;
    return (now - this.windowStartInMillis) * this.warpFactor + this.windowStartInMillis;
  }
}
