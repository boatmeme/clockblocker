import ClockTime, { ClockTimeComparison } from './ClockTime';

export enum TimeWindowComparison {
  EARLIER = -1,
  WITHIN = 0,
  LATER = 1,
}
export default class TimeWindow {
  private start: ClockTime;
  private end: ClockTime;
  private _timeZone: string;

  constructor(start: ClockTime, end: ClockTime, timeZone = `UTC`) {
    this.start = start;
    this.end = end;
    this._timeZone = timeZone;
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

  clone() {
    return new TimeWindow(this.start, this.end, this._timeZone);
  }

  compareWithinWindow(timeInMillis: number) {
    if (timeInMillis < this.windowStartInMillis) return TimeWindowComparison.EARLIER;
    if (timeInMillis >= this.windowEndInMillis) return TimeWindowComparison.LATER;
    return TimeWindowComparison.WITHIN;
  }
}
