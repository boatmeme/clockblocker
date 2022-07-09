import ClockTime from './ClockTime';
import TimeWindow from './TimeWindow';
export default abstract class RelativeTimeWindow extends TimeWindow {
  protected referenceDurationInMillis: number;
  constructor(
    start: ClockTime,
    end: ClockTime,
    referenceDurationInMillis: number = end.forTodayInMillis() - start.forTodayInMillis(),
  ) {
    super(start, end);
    this.referenceDurationInMillis = referenceDurationInMillis;
  }

  abstract get warpFactor(): number;

  abstract get referenceEndInMillis(): number;

  abstract get relativeTimeInMillis(): number;
}
