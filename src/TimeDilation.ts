export default class TimeDilation {
  start: Date;
  end: Date;
  constructor(start: Date, end: Date) {
    this.start = start;
    this.end = end;
  }

  get startInMillis() {
    return this.start.getTime();
  }

  get endInMillis() {
    return this.end.getTime();
  }

  get relativeTimeInMillis() {
    const now = Date.now();
    if (now <= this.startInMillis || now >= this.endInMillis) return now;
    return now - 100;
  }
}
