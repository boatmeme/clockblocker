export default class Clock {
  private _offset = 0;
  private _lastCheck: number;
  constructor() {
    this._lastCheck = this.referenceTimeInMillis;
  }
  get referenceTimeInMillis() {
    return Date.now();
  }

  get offset() {
    /*
    1000 - 2000 - normal time
    2000 - 3000 - half-time
    3000 - 4000 - double-time
    4000 - on - normal time
    */
    const now = this.referenceTimeInMillis;
    let newOffset = 0;

    if (now >= 2000 && this._lastCheck < 3000) {
      const warp = 0.5;
      const millisInWindow = Math.min(now, 3000) - Math.max(2000, this._lastCheck);
      newOffset -= millisInWindow * warp;
    }

    if (now >= 3000 && this._lastCheck < 4000) {
      const warp = 0.5;
      const millisInWindow = Math.min(now, 4000) - Math.max(3000, this._lastCheck);
      newOffset += millisInWindow * warp;
    }
    return (this._offset = this._offset + newOffset);
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
