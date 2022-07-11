import { Temporal } from '@js-temporal/polyfill';
import TimeWindow from './TimeWindow';

export interface Duration {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}
export default abstract class RelativeTimeDistortion {
  protected timeWindow: TimeWindow;
  protected referenceDurationInMillis: number;
  constructor(timeWindow: TimeWindow, referenceDuration: Duration = { milliseconds: timeWindow.durationInMillis }) {
    this.timeWindow = timeWindow;
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
    const millisInWindow = length - offset;
    return this.distortTime(millisInWindow, offset);
  }

  protected abstract distortTime(numberOfMilliseconds: number, offset?: number): number;
}
