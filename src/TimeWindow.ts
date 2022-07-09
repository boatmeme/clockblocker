import ClockTime from './ClockTime';
export default class TimeWindow {
  private start: ClockTime;
  private end: ClockTime;
  private _timeZone = 'UTC';
  constructor(start: ClockTime, end: ClockTime) {
    this.start = start;
    this.end = end;
  }

  get windowStartInMillis() {
    return this.start.forTodayInMillis(this._timeZone);
  }

  get windowEndInMillis() {
    return this.end.forTodayInMillis(this._timeZone);
  }

  get durationInMillis() {
    return this.windowEndInMillis - this.windowStartInMillis;
  }
}
