import ClockTime, { ClockTimeComparison } from './ClockTime';
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
    if (this.end.compare(this.start) === ClockTimeComparison.EARLIER) {
      return this.end.forTomorrowInMillis(this._timeZone);
    }
    return this.end.forTodayInMillis(this._timeZone);
  }

  get durationInMillis() {
    return this.windowEndInMillis - this.windowStartInMillis;
  }
}
