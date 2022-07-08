export default class TimeWindow {
  protected start: Date;
  protected end: Date;
  constructor(start: Date, end: Date) {
    this.start = start;
    this.end = end;
  }

  get windowStartInMillis() {
    return this.start.getTime();
  }

  get windowEndInMillis() {
    return this.end.getTime();
  }
}
