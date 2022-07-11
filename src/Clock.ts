import RelativeTimeDistortion from './RelativeTimeDistortion';
import { TimeWindowComparison } from './TimeWindow';

export default class Clock {
  private _offset = 0;
  private _lastCheck: number;
  private _timeDistortions: Array<RelativeTimeDistortion>;
  constructor(timeDistortions: Array<RelativeTimeDistortion> = []) {
    this._lastCheck = this.referenceTimeInMillis;
    this._timeDistortions = timeDistortions;
  }

  get referenceTimeInMillis() {
    return Date.now();
  }

  get offset() {
    const now = this.referenceTimeInMillis;
    return (this._offset = this._timeDistortions.reduce((offset, distortion) => {
      const window = distortion.getTimeWindow();
      const nowComparison = window.compareWithinWindow(now);
      if (nowComparison === TimeWindowComparison.EARLIER) return offset;
      const lastCheckComparison = window.compareWithinWindow(this._lastCheck);
      if (lastCheckComparison === TimeWindowComparison.LATER) return offset;
      const timeSinceLastCheck = now - this._lastCheck;
      const windowOffset = Math.max(0, timeSinceLastCheck - window.windowStartInMillis);
      const windowLength = Math.min(
        window.durationInMillis,
        Math.min(now - window.windowStartInMillis, timeSinceLastCheck, window.windowEndInMillis - this._lastCheck),
      );
      return offset + distortion.getElapsedTimeInMillis(windowOffset, windowLength);
    }, this._offset));
  }

  private markLastCheck() {
    this._lastCheck = this.referenceTimeInMillis;
  }

  get relativeTimeInMillis() {
    const relativeTime = this.referenceTimeInMillis + this.offset;
    this.markLastCheck();
    return relativeTime;
  }
}
