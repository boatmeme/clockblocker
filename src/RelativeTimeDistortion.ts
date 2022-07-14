import { Temporal } from '@js-temporal/polyfill';
import ClockTime, { ClockTimeDescriptor } from './ClockTime';
import TimeWindow from './TimeWindow';

export interface Duration {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}
export default abstract class RelativeTimeDistortion {
  protected timeWindow: TimeWindow;
  protected startClockTime: ClockTime;
  protected relativeDurationInMillis: number;
  protected referenceDurationInMillis: number;
  constructor(
    referenceStartClockTime: ClockTimeDescriptor,
    relativeDuration: Duration,
    referenceDuration: Duration = relativeDuration,
  ) {
    this.startClockTime = new ClockTime(referenceStartClockTime);
    this.timeWindow = new TimeWindow(this.startClockTime, this.startClockTime.add(referenceDuration));
    this.relativeDurationInMillis = Temporal.Duration.from(relativeDuration).round({
      largestUnit: 'millisecond',
    }).milliseconds;
    this.referenceDurationInMillis = Temporal.Duration.from(referenceDuration).round({
      largestUnit: 'millisecond',
    }).milliseconds;
  }

  getTimeWindow() {
    return this.timeWindow.clone();
  }

  getElapsedTimeInMillis(
    offset = 0,
    length: number = this.timeWindow.windowEndInMillis - this.timeWindow.windowStartInMillis,
  ) {
    return this.distortTime(length, offset);
  }

  protected abstract distortTime(numberOfMilliseconds: number, offset?: number): number;
}
