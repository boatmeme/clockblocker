import TimeWindow from './TimeWindow';
export default abstract class RelativeTimeWindow extends TimeWindow {
  protected realDurationInMillis: number;
  constructor(start: Date, end: Date, realDurationInMillis: number = end.getTime() - start.getTime()) {
    super(start, end);
    this.realDurationInMillis = realDurationInMillis;
  }

  abstract get warpFactor(): number;

  abstract get referenceEndInMillis(): number;

  abstract get relativeTimeInMillis(): number;
}
