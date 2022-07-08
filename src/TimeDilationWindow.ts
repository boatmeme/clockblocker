import RelativeTimeWindow from './RelativeTimeWindow';
export default class TimeDilationWindow extends RelativeTimeWindow {
  get warpFactor() {
    return (this.end.getTime() - this.start.getTime()) / this.realDurationInMillis;
  }

  get referenceEndInMillis() {
    return this.start.getTime() + this.realDurationInMillis;
  }

  get relativeTimeInMillis() {
    const now = Date.now();
    if (now <= this.windowStartInMillis || now >= this.referenceEndInMillis) return now;
    return (now - this.start.getTime()) * this.warpFactor + this.start.getTime();
  }
}
