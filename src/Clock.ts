import RelativeTimeDistortion from './RelativeTimeDistortion';

export default class Clock {
  private _offset = 0;
  private _lastCheck: number;
  // The run anchor pins every window to a single fixed [start, end) occurrence, captured
  // once at construction. Windows no longer re-resolve to "today" on each read, which is
  // what made overnight (cross-midnight) and sparsely-polled clocks drop their distortions.
  private _runAnchor: number;
  private _timeDistortions: Array<RelativeTimeDistortion>;
  constructor(timeDistortions: Array<RelativeTimeDistortion> = []) {
    this._lastCheck = this.referenceTimeInMillis;
    this._runAnchor = this._lastCheck;
    this._timeDistortions = timeDistortions;
  }

  get referenceTimeInMillis() {
    return Date.now();
  }

  get offset() {
    const now = this.referenceTimeInMillis;
    this._offset = this._timeDistortions.reduce((offset, distortion) => {
      const { startMs, endMs } = distortion.getTimeWindow().resolveAt(this._runAnchor);
      if (now < startMs) return offset; // window has not started yet
      if (this._lastCheck >= endMs) return offset; // window already finished before last check
      const timeSinceLastCheck = now - this._lastCheck;
      const windowOffset = Math.max(0, this._lastCheck - startMs);
      const windowLength = Math.min(
        endMs - startMs,
        Math.min(now - startMs, timeSinceLastCheck, endMs - this._lastCheck),
      );
      return offset + distortion.getElapsedTimeInMillis(windowOffset, windowLength);
    }, this._offset);
    // Consume the elapsed slice so that reading `offset` (or `relativeTimeInMillis`) again
    // without time advancing does not accumulate the same interval twice.
    this._lastCheck = now;
    return this._offset;
  }

  get relativeTimeInMillis() {
    return this.referenceTimeInMillis + this.offset;
  }
}
