import RelativeTimeDistortion from './RelativeTimeDistortion';

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
      return offset + distortion.getOffset(now, this._lastCheck);
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
