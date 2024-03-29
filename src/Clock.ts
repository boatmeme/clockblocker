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
      if (window.compareWithinWindow(now) === TimeWindowComparison.EARLIER) return offset;
      if (window.compareWithinWindow(this._lastCheck) === TimeWindowComparison.LATER) return offset;
      const timeSinceLastCheck = now - this._lastCheck;
      const windowOffset = Math.max(0, this._lastCheck - window.windowStartInMillis);
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
