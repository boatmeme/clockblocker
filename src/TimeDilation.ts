export default class TimeDilation {
  start: Date;
  end: Date;
  realDurationInMillis: number;
  constructor(start: Date, end: Date, realDurationInMillis: number = end.getTime() - start.getTime()) {
    this.start = start;
    this.end = end;
    this.realDurationInMillis = realDurationInMillis;
  }

  get dilationFactor() {
    return (this.end.getTime() - this.start.getTime()) / this.realDurationInMillis;
  }

  get startInMillis() {
    return this.start.getTime();
  }

  get endInMillis() {
    return this.end.getTime();
  }

  get actualEndInMillis() {
    return this.start.getTime() + this.realDurationInMillis;
  }

  get relativeTimeInMillis() {
    const now = Date.now();
    if (now <= this.startInMillis || now >= this.actualEndInMillis) return now;
    return (now - this.start.getTime()) * this.dilationFactor + this.start.getTime();
  }
}
